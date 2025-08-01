document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('reviews-body');
    const saveButton = document.getElementById('save-button');
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const sortableHeaders = document.querySelectorAll('.sortable');
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const factoryFilter = document.getElementById('factoryFilter');
    const movementFilter = document.getElementById('movementFilter');
    const ratingFilter = document.getElementById('ratingFilter');
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

    // Fetch and parse CSV data
    fetch('data/reviews.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    allReviews = results.data.map(row => ({
                        ...row,
                        rating: parseFloat(row.rating) || 0,
                        id: row.id || generateUUID()
                    }));
                    defaultSortAndRender();
                    populateFilters(allReviews);
                }
            });
        })
        .catch(error => {
            console.error('Could not load or parse reviews.csv:', error);
            tableBody.innerHTML = '<tr><td colspan="8">Could not load reviews.</td></tr>';
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
            
            // Create only one row per product group (consolidate all variations on mobile)
            const row = document.createElement('tr');
            row.dataset.key = key; // Use the product key instead of individual variation key
            
            // Always create the consolidated layout (mobile will show variations table, desktop will show first item)
            const review = group[0]; // Use first review for basic product info
            const rowspan = group.length; // Always span all variations for desktop
            // Image cell with mobile details
            const cellImage = document.createElement('td');
            cellImage.rowSpan = rowspan;
            cellImage.dataset.col = 'image_url';
            cellImage.dataset.label = 'Image';
            const imageUrl = group.find(r => r.image_url && r.image_url.trim() !== '')?.image_url || '/assets/default.png';
            
            // Create mobile-friendly layout with image and details
                    const imageElement = `<img src="${imageUrl}" class="review-image" alt="${review.brand} ${review.model}" >`;
            
            // Create the mobile layout with image and details section
            let mobileLayout = '<div class="mobile-image-section">';
            mobileLayout += imageElement;
            
            mobileLayout += '<div class="mobile-details">';
            if (review.brand && review.brand.trim()) {
                mobileLayout += `<div class="detail-item"><span class="detail-label">Brand:</span><span class="detail-value">${review.brand}</span></div>`;
            }
            if (review.model && review.model.trim()) {
                mobileLayout += `<div class="detail-item"><span class="detail-label">Model:</span><span class="detail-value">${review.model}</span></div>`;
            }
            if (review.reference_number && review.reference_number.trim()) {
                mobileLayout += `<div class="detail-item"><span class="detail-label">Reference:</span><span class="detail-value">${review.reference_number}</span></div>`;
            }
            mobileLayout += '</div>'; // Close mobile-details
            mobileLayout += '</div>'; // Close mobile-image-section
            
            // Create variations table for all factory/version combinations
            let variationsTable = '<table class="mobile-variations">';
            variationsTable += '<thead><tr><th>Factory</th><th>Version</th><th>Movement</th><th>Rating</th><th>Notes</th></tr></thead>';
            variationsTable += '<tbody>';
            
            // Add all variations for this product with color highlighting
            group.forEach(variation => {
                let rowClass = '';
                if (variation.rating >= 4.5) {
                    rowClass = ' class="highlight-gold"';
                } else if (variation.rating >= 4.0) {
                    rowClass = ' class="highlight-green"';
                }
                
                variationsTable += `<tr${rowClass}>`;
                variationsTable += `<td>${variation.factory || ''}</td>`;
                variationsTable += `<td>${variation.version || ''}</td>`;
                variationsTable += `<td>${variation.movement || ''}</td>`;
                variationsTable += `<td class="rating-cell">${variation.rating ? variation.rating.toFixed(1) : '0.0'}</td>`;
                variationsTable += `<td>${variation.notes || ''}</td>`;
                variationsTable += '</tr>';
            });
            
            variationsTable += '</tbody></table>';
            
            // Combine everything into the final mobile layout
            let finalMobileContent = mobileLayout + '<div class="mobile-details">' + variationsTable + '</div>';
            
            // Debug: log what we're generating
            console.log('Final mobile content:', finalMobileContent);
            console.log('Group data:', group);
            
            cellImage.innerHTML = finalMobileContent;
            row.appendChild(cellImage);

            // Grouped cells (brand, model, reference)
            ['brand', 'model', 'reference_number'].forEach(colName => {
                const cell = document.createElement('td');
                cell.rowSpan = rowspan;
                cell.dataset.col = colName;
                cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1).replace('_', ' ');
                cell.textContent = review[colName];
                row.appendChild(cell);
            });
        
            // Only create the first row (main product row)
            const variation = group[0]; // Use first variation for the main row
        
            // Non-grouped cells (factory, version, movement, rating, notes)
            ['factory', 'version', 'movement', 'rating', 'notes'].forEach(colName => {
                const cell = document.createElement('td');
                cell.dataset.col = colName;
                cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1);
                
                const valueSpan = document.createElement('span');
                if (colName === 'rating') {
                    valueSpan.textContent = variation.rating ? variation.rating.toFixed(1) : '0.0';
                } else {
                    valueSpan.textContent = variation[colName] || '';
                }
                cell.appendChild(valueSpan);
                row.appendChild(cell);
            });

            highlightRow(row, variation.rating);
            tableBody.appendChild(row);
        
            // For desktop: create additional rows for other variations (these will be hidden on mobile)
            for (let i = 1; i < group.length; i++) {
                const additionalVariation = group[i];
                const additionalRow = document.createElement('tr');
                additionalRow.dataset.key = `${additionalVariation.id}|${additionalVariation.factory}|${additionalVariation.version}`;
                additionalRow.classList.add('desktop-only-variation');
                
                // Non-grouped cells for additional variations
                ['factory', 'version', 'movement', 'rating', 'notes'].forEach(colName => {
                    const cell = document.createElement('td');
                    cell.dataset.col = colName;
                    cell.dataset.label = colName.charAt(0).toUpperCase() + colName.slice(1);
                    
                    const valueSpan = document.createElement('span');
                    if (colName === 'rating') {
                        valueSpan.textContent = additionalVariation.rating ? additionalVariation.rating.toFixed(1) : '0.0';
                    } else {
                        valueSpan.textContent = additionalVariation[colName] || '';
                    }
                    cell.appendChild(valueSpan);
                    additionalRow.appendChild(cell);
                });

                highlightRow(additionalRow, additionalVariation.rating);
                tableBody.appendChild(additionalRow);
            }
        }

        if (editModeToggle.checked) {
            makeTableEditable();
        }
    }

    function highlightRow(row, rating) {
        const cellsToHighlight = row.querySelectorAll('td:nth-last-child(-n+5)');
        cellsToHighlight.forEach(cell => {
            cell.classList.remove('highlight-gold', 'highlight-green');
            if (rating >= 4.5) {
                cell.classList.add('highlight-gold');
            } else if (rating >= 4.0) {
                cell.classList.add('highlight-green');
            }
        });
    }

    function findReviewByKey(key) {
        if (!key) return null;
        const [id, factory, version] = key.split('|');
        return allReviews.find(r => r.id === id && r.factory === factory && r.version === version);
    }

    function makeTableEditable() {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Make standard cells editable
            row.querySelectorAll('td[data-col]').forEach(cell => {
                if (['factory', 'version', 'movement', 'rating', 'notes'].includes(cell.dataset.col)) {
                    cell.contentEditable = true;
                    cell.classList.add('editable');
                }
            });

            // Handle the image cell specifically
            const imageCell = row.querySelector('td[data-col="image_url"]');
            if (imageCell) {
                const key = row.dataset.key;
                const review = findReviewByKey(key);
                if (review) {
                    const imageUrl = review.image_url || '';
                    imageCell.innerHTML = `<input type="text" class="image-url-input" value="${imageUrl}" placeholder="Enter Image URL">`;
                    imageCell.classList.add('editable');
                }
            }
        });
    }

    function disableTableEditing() {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const key = row.dataset.key;
            const review = findReviewByKey(key);
            if (!review) return;

            // Make standard cells non-editable and save their content
            row.querySelectorAll('td[data-col]').forEach(cell => {
                const colName = cell.dataset.col;
                if (['factory', 'version', 'movement', 'rating', 'notes'].includes(colName)) {
                    cell.contentEditable = false;
                    cell.classList.remove('editable');
                    
                    let newValue = cell.textContent.trim();
                    if (colName === 'rating') {
                        const parsedValue = parseFloat(newValue);
                        newValue = isNaN(parsedValue) ? 0 : parsedValue;
                    }
                    review[colName] = newValue;
                }
            });

            // Handle the image cell specifically
            const imageCell = row.querySelector('td[data-col="image_url"]');
            if (imageCell) {
                const input = imageCell.querySelector('.image-url-input');
                if (input) {
                    const newUrl = input.value.trim();
                    review.image_url = newUrl; // Update data model
                    const displayUrl = newUrl ? newUrl : `assets/${review.id}.webp`;
                    imageCell.innerHTML = `<img src="${displayUrl}" class="review-image" alt="${review.brand} ${review.model}" onerror="this.onerror=null;this.src='assets/default.png';">`;
                }
                imageCell.classList.remove('editable');
            }
            
            // After updating data, re-apply highlighting
            highlightRow(row, review.rating);
        });
    }

    editModeToggle.addEventListener('change', () => {
        saveButton.style.display = editModeToggle.checked ? 'block' : 'none';
        if (editModeToggle.checked) {
            makeTableEditable();
        } else {
            disableTableEditing(); // This now saves the data
        }
    });

    saveButton.addEventListener('click', () => {
        // The main save logic is now handled when disabling edit mode.
        // This button will now just download the CSV.
        const csv = Papa.unparse(allReviews, { header: true });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reviews.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            if (!sortKey) return;

            const direction = (currentSort.key === sortKey && currentSort.direction === 'asc') ? 'desc' : 'asc';
            currentSort = { key: sortKey, direction };

            allReviews.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                if (sortKey === 'rating') {
                    return direction === 'asc' ? (valA - valB) : (valB - valA);
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
            movement: new Set()
        };

        reviews.forEach(review => {
            if (review.brand) filters.brand.add(review.brand);
            if (review.model) filters.model.add(review.model);
            if (review.factory) filters.factory.add(review.factory);
            if (review.movement) filters.movement.add(review.movement);
        });

        populateSelect(brandFilter, filters.brand);
        populateSelect(modelFilter, filters.model);
        populateSelect(factoryFilter, filters.factory);
        populateSelect(movementFilter, filters.movement);
    }

    function populateSelect(selectElement, values) {
        const currentValue = selectElement.value;
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        Array.from(values).sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
        selectElement.value = currentValue;
    }

    function applyFilters() {
        const searchValue = searchInput.value.toLowerCase();
        const brandValue = brandFilter.value;
        const modelValue = modelFilter.value;
        const factoryValue = factoryFilter.value;
        const movementValue = movementFilter.value;
        const ratingValue = parseFloat(ratingFilter.value) || 0;

        const filteredReviews = allReviews.filter(review => {
            const searchMatch = searchValue === '' ||
                Object.values(review).some(val =>
                    String(val).toLowerCase().includes(searchValue)
                );

            return searchMatch &&
                (brandValue === '' || review.brand === brandValue) &&
                (modelValue === '' || review.model === modelValue) &&
                (factoryValue === '' || review.factory === factoryValue) &&
                (movementValue === '' || review.movement === movementValue) &&
                (review.rating >= ratingValue);
        });

        renderTable(filteredReviews);
    }

    [searchInput, brandFilter, modelFilter, factoryFilter, movementFilter, ratingFilter].forEach(el => {
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
        applyFilters();
    });
});
