document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('reviews-body');
    const sortableHeaders = document.querySelectorAll('.sortable');
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const factoryFilter = document.getElementById('factoryFilter');
    const movementFilter = document.getElementById('movementFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const maxPriceFilter = document.getElementById('maxPriceFilter');
    const maxSizeFilter = document.getElementById('maxSizeFilter');
    const maxThicknessFilter = document.getElementById('maxThicknessFilter');
    const complicationsFilter = document.getElementById('complicationsFilter');
    const clearFiltersButton = document.getElementById('clearFiltersButton');

    let allReviews = [];
    let currentSort = { key: 'brand', direction: 'asc' };

    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const fetchReviews = fetch('data/reviews.csv')
        .then(response => response.text())
        .then(csvText => {
            return new Promise(resolve => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        allReviews = results.data.map(row => ({
                            ...row,
                            rating: parseFloat(row.rating) || 0,
                            market_price: parseFloat(row.market_price) || null,
                            case_size: parseFloat(row.case_size) || null,
                            thickness: parseFloat(row.thickness) || null,
                            id: row.id || generateUUID()
                        }));
                        resolve();
                    }
                });
            });
        });


    Promise.all([fetchReviews])
        .then(() => {
            defaultSortAndRender();
            populateFilters(allReviews);
            updateFilterOptions();
        })
        .catch(error => {
            console.error('Could not load or parse CSV data:', error);
            tableBody.innerHTML = '<tr><td colspan="9">Could not load data.</td></tr>';
        });

    function defaultSortAndRender() {
        // Default sort: Brand (asc), Model (asc), Reference (asc), Rating (desc)
        allReviews.sort((a, b) => {
            const brandCompare = a.brand.localeCompare(b.brand);
            if (brandCompare !== 0) return brandCompare;
            const modelCompare = a.model.localeCompare(b.model);
            if (modelCompare !== 0) return modelCompare;
            const refCompare = a.reference_number.localeCompare(b.reference_number);
            if (refCompare !== 0) return refCompare;
            return b.rating - a.rating; // Descending rating
        });
        renderTable(allReviews);
        updateSortIcons();
    }

    function renderTable(reviews) {
        tableBody.innerHTML = '';
        const groupedReviews = reviews.reduce((acc, review) => {
            const key = `${review.brand}|${review.model}|${review.reference_number}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(review);
            return acc;
        }, {});

        for (const key in groupedReviews) {
            const group = groupedReviews[key];
            const sharedData = {
                image_url: group.find(r => r.image_url && r.image_url.trim() !== '')?.image_url || '/assets/default.png',
                brand: group[0].brand,
                model: group[0].model,
                reference_number: group[0].reference_number,
                market_price: group.find(r => r.market_price != null && r.market_price !== '')?.market_price || '',
                case_size: group.find(r => r.case_size != null && r.case_size !== '')?.case_size || '',
                thickness: group.find(r => r.thickness != null && r.thickness !== '')?.thickness || '',
                complications: group.find(r => r.complications != null && r.complications !== '')?.complications || ''
            };

            // Create the first row with rowspan for shared columns
            const firstRow = document.createElement('tr');
            firstRow.dataset.key = `${group[0].id}|${group[0].factory}|${group[0].version}`;
            
            // Image cell with rowspan
            const imageCell = document.createElement('td');
            imageCell.rowSpan = group.length;
            imageCell.dataset.col = 'image_url';
            imageCell.dataset.label = 'Image';
            
            // Desktop image wrapper
            const desktopImageWrapper = document.createElement('div');
            desktopImageWrapper.className = 'desktop-image-wrapper';
            desktopImageWrapper.innerHTML = `<img src="${sharedData.image_url}" class="review-image" alt="${sharedData.brand} ${sharedData.model}">`;
            
            // Mobile layout sections
            const mobileGenuineData = document.createElement('div');
            mobileGenuineData.className = 'mobile-genuine-data';
            mobileGenuineData.innerHTML = `
                <div class="mobile-group-header">Genuine Watch Data</div>
                <div class="mobile-image-section">
                    <img src="${sharedData.image_url}" class="review-image" alt="${sharedData.brand} ${sharedData.model}">
                    <div class="mobile-details">
                        ${sharedData.brand ? `<div class="detail-item"><span class="detail-label">Brand:</span><span class="detail-value">${sharedData.brand}</span></div>` : ''}
                        ${sharedData.model ? `<div class="detail-item"><span class="detail-label">Model:</span><span class="detail-value">${sharedData.model}</span></div>` : ''}
                        ${sharedData.reference_number ? `<div class="detail-item"><span class="detail-label">Reference:</span><span class="detail-value">${sharedData.reference_number}</span></div>` : ''}
                        ${sharedData.market_price ? `<div class="detail-item"><span class="detail-label">Price:</span><span class="detail-value">$${sharedData.market_price}</span></div>` : ''}
                        ${sharedData.case_size ? `<div class="detail-item"><span class="detail-label">Size:</span><span class="detail-value">${sharedData.case_size}mm</span></div>` : ''}
                        ${sharedData.thickness ? `<div class="detail-item"><span class="detail-label">Thickness:</span><span class="detail-value">${sharedData.thickness}mm</span></div>` : ''}
                        ${sharedData.complications ? `<div class="detail-item"><span class="detail-label">Complications:</span><span class="detail-value">${sharedData.complications}</span></div>` : ''}
                    </div>
                </div>
            `;
            
            // Mobile replica data section
            const mobileReplicaData = document.createElement('div');
            mobileReplicaData.className = 'mobile-replica-data';
            let variationsTableHTML = `
                <div class="mobile-group-header">Replica Details</div>
                <div class="mobile-variations-container">
                    <table class="mobile-variations">
                        <thead>
                            <tr>
                                <th>Factory</th>
                                <th>Version</th>
                                <th>Movement</th>
                                <th>Rating</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            group.forEach(variation => {
                let rowClass = '';
                if (variation.rating >= 4.5) {
                    rowClass = ' class="highlight-gold"';
                } else if (variation.rating >= 4.0) {
                    rowClass = ' class="highlight-green"';
                }
                variationsTableHTML += `
                    <tr${rowClass}>
                        <td>${variation.factory || ''}</td>
                        <td>${variation.version || ''}</td>
                        <td>${variation.movement || ''}</td>
                        <td class="rating-cell">${variation.rating ? variation.rating.toFixed(1) : '0.0'}</td>
                        <td>${variation.notes || ''}</td>
                    </tr>
                `;
            });
            
            variationsTableHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            mobileReplicaData.innerHTML = variationsTableHTML;
            
            imageCell.appendChild(desktopImageWrapper);
            imageCell.appendChild(mobileGenuineData);
            imageCell.appendChild(mobileReplicaData);
            firstRow.appendChild(imageCell);

            // Shared data columns with rowspan
            ['brand', 'model', 'reference_number', 'market_price', 'case_size', 'thickness', 'complications'].forEach(colName => {
                const cell = document.createElement('td');
                cell.rowSpan = group.length;
                cell.dataset.col = colName;
                cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1).replace(/_/g, ' ');
                
                let displayValue = sharedData[colName] || '';
                if (colName === 'market_price' && displayValue) displayValue = `$${displayValue}`;
                cell.textContent = displayValue;
                firstRow.appendChild(cell);
            });

            // First variation columns
            ['factory', 'version', 'movement', 'rating', 'notes'].forEach(colName => {
                const cell = document.createElement('td');
                cell.dataset.col = colName;
                cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1);
                
                let displayValue = group[0][colName] || '';
                if (colName === 'rating' && displayValue) displayValue = parseFloat(displayValue).toFixed(1);
                cell.textContent = displayValue;
                firstRow.appendChild(cell);
            });

            highlightRow(firstRow, group[0].rating);
            tableBody.appendChild(firstRow);

            // Additional variation rows
            for (let i = 1; i < group.length; i++) {
                const variation = group[i];
                const row = document.createElement('tr');
                row.dataset.key = `${variation.id}|${variation.factory}|${variation.version}`;
                row.classList.add('variation-row');

                ['factory', 'version', 'movement', 'rating', 'notes'].forEach(colName => {
                    const cell = document.createElement('td');
                    cell.dataset.col = colName;
                    cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1);
                    
                    let displayValue = variation[colName] || '';
                    if (colName === 'rating' && displayValue) displayValue = parseFloat(displayValue).toFixed(1);
                    cell.textContent = displayValue;
                    row.appendChild(cell);
                });

                highlightRow(row, variation.rating);
                tableBody.appendChild(row);
            }
        }
    }

    function highlightRow(row, rating) {
        const colsToHighlight = ['factory', 'version', 'movement', 'rating', 'notes'];
        colsToHighlight.forEach(colName => {
            const cell = row.querySelector(`td[data-col="${colName}"]`);
            if (cell) {
                cell.classList.remove('highlight-gold', 'highlight-green');
                if (rating >= 4.5) {
                    cell.classList.add('highlight-gold');
                } else if (rating >= 4.0) {
                    cell.classList.add('highlight-green');
                }
            }
        });
    }


    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            if (!sortKey) return;

            const direction = (currentSort.key === sortKey && currentSort.direction === 'asc') ? 'desc' : 'asc';
            currentSort = { key: sortKey, direction };

            allReviews.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                const numericColumns = ['rating', 'market_price', 'case_size', 'thickness'];
                if (numericColumns.includes(sortKey)) {
                    return direction === 'asc' ? ((valA || 0) - (valB || 0)) : ((valB || 0) - (valA || 0));
                }
                if (String(valA).localeCompare(String(valB)) < 0) return direction === 'asc' ? -1 : 1;
                if (String(valA).localeCompare(String(valB)) > 0) return direction === 'asc' ? 1 : -1;
                return 0;
            });

            renderTable(allReviews);
            updateSortIcons();
        });
    });

    function updateSortIcons() {
        sortableHeaders.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            if (!icon) return;
            if (header.dataset.sort === currentSort.key) {
                icon.textContent = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            } else {
                icon.textContent = '';
            }
        });
    }

    function populateFilters(reviews) {
        const filters = {
            brand: new Set(),
            model: new Set(),
            factory: new Set(),
            movement: new Set(),
            complications: new Set()
        };

        reviews.forEach(review => {
            if (review.brand) filters.brand.add(review.brand);
            if (review.model) filters.model.add(review.model);
            if (review.factory) filters.factory.add(review.factory);
            if (review.movement) filters.movement.add(review.movement);
            if (review.complications) {
                review.complications.split(',').forEach(comp => {
                    if (comp.trim()) filters.complications.add(comp.trim());
                });
            }
        });

        populateSelect(brandFilter, filters.brand);
        populateSelect(modelFilter, filters.model);
        populateSelect(factoryFilter, filters.factory);
        populateSelect(movementFilter, filters.movement);
        populateSelect(complicationsFilter, filters.complications);
    }

    function populateSelect(selectElement, values) {
        const currentValue = selectElement.value;
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        const sortedValues = Array.from(values).sort();
        sortedValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
        // Preserve selection if it still exists; otherwise clear it
        if (currentValue && sortedValues.includes(currentValue)) {
            selectElement.value = currentValue;
        } else {
            selectElement.value = '';
        }
    }

    // Build an object representing current active filters/inputs
    function getActiveFilters() {
        return {
            search: (searchInput.value || '').toLowerCase(),
            brand: brandFilter.value,
            model: modelFilter.value,
            factory: factoryFilter.value,
            movement: movementFilter.value,
            rating: parseFloat(ratingFilter.value) || 0,
            maxPrice: parseFloat(maxPriceFilter.value) || Infinity,
            maxSize: parseFloat(maxSizeFilter.value) || Infinity,
            maxThickness: parseFloat(maxThicknessFilter.value) || Infinity,
            complications: complicationsFilter.value
        };
    }

    // Check if a review matches the provided filters. Optionally exclude one key when
    // computing available options for that particular filter.
    function reviewMatchesFilters(review, filters, excludeKey = null) {
        const exclude = (key) => excludeKey === key;

        // Text search across all values
        if (!exclude('search')) {
            const search = filters.search;
            const searchMatch = search === '' || Object.values(review).some(val => String(val).toLowerCase().includes(search));
            if (!searchMatch) return false;
        }

        if (!exclude('brand') && filters.brand && review.brand !== filters.brand) return false;
        if (!exclude('model') && filters.model && review.model !== filters.model) return false;
        if (!exclude('factory') && filters.factory && review.factory !== filters.factory) return false;
        if (!exclude('movement') && filters.movement && review.movement !== filters.movement) return false;

        if (!exclude('rating') && review.rating < filters.rating) return false;

        if (!exclude('maxPrice')) {
            if (!(review.market_price === null || review.market_price <= filters.maxPrice)) return false;
        }
        if (!exclude('maxSize')) {
            if (!(review.case_size === null || review.case_size <= filters.maxSize)) return false;
        }
        if (!exclude('maxThickness')) {
            if (!(review.thickness === null || review.thickness <= filters.maxThickness)) return false;
        }

        if (!exclude('complications') && filters.complications) {
            const compStr = (review.complications || '').toLowerCase();
            if (!compStr.includes(filters.complications.toLowerCase())) return false;
        }

        return true;
    }

    // Update each dropdown's options based on other active filters
    function updateFilterOptions() {
        const filters = getActiveFilters();

        // For each select, compute available values from reviews that match all other filters
        const computeSet = (key) => {
            const subset = allReviews.filter(r => reviewMatchesFilters(r, filters, key));
            const set = new Set();
            if (key === 'complications') {
                subset.forEach(r => {
                    if (r.complications) {
                        r.complications.split(',').forEach(c => { const v = c.trim(); if (v) set.add(v); });
                    }
                });
            } else {
                subset.forEach(r => { if (r[key]) set.add(r[key]); });
            }
            return set;
        };

        populateSelect(brandFilter, computeSet('brand'));
        populateSelect(modelFilter, computeSet('model'));
        populateSelect(factoryFilter, computeSet('factory'));
        populateSelect(movementFilter, computeSet('movement'));
        populateSelect(complicationsFilter, computeSet('complications'));
    }

    function applyFilters() {
        const filters = getActiveFilters();

        const filteredReviews = allReviews.filter(review => reviewMatchesFilters(review, filters));

        // Update available options to reflect current constraints
        updateFilterOptions();

        renderTable(filteredReviews);
    }

    [searchInput, brandFilter, modelFilter, factoryFilter, movementFilter, ratingFilter, maxPriceFilter, maxSizeFilter, maxThicknessFilter, complicationsFilter].forEach(el => {
        el.addEventListener('input', applyFilters);
        if (el.tagName === 'SELECT') {
            el.addEventListener('change', applyFilters);
        }
    });

    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        brandFilter.value = '';
        modelFilter.value = '';
        factoryFilter.value = '';
        movementFilter.value = '';
        ratingFilter.value = '';
        maxPriceFilter.value = '';
        maxSizeFilter.value = '';
        maxThicknessFilter.value = '';
        complicationsFilter.value = '';
        applyFilters();
    });

    // -------------------------------
    // Lightweight Image Lightbox
    // -------------------------------
    function ensureLightbox() {
        let overlay = document.getElementById('image-lightbox-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'image-lightbox-overlay';
            overlay.innerHTML = '<button id="image-lightbox-close" aria-label="Close image">×</button><img id="image-lightbox-img" alt="Full size image">';
            document.body.appendChild(overlay);

            // Close when clicking outside the image
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('visible');
                }
            });

            // Close when clicking the X button
            overlay.addEventListener('click', (e) => {
                const btn = e.target.closest('#image-lightbox-close');
                if (btn) {
                    overlay.classList.remove('visible');
                }
            });

            // Close on Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    overlay.classList.remove('visible');
                }
            });
        }
        return overlay;
    }

    // Delegate clicks on any review image
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.review-image');
        if (!img) return;
        const overlay = ensureLightbox();
        const fullImg = overlay.querySelector('#image-lightbox-img');
        fullImg.src = img.src;
        fullImg.alt = img.alt || 'Full size image';
        overlay.classList.add('visible');
    });
});
