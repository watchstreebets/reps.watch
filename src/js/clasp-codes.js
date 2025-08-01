document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('clasp-codes-body');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersButton = document.getElementById('clearFiltersButton');

    let allClaspCodes = [];

    // Fetch and parse CSV data
    fetch('/data/clasp_codes.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    allClaspCodes = results.data;
                    renderTable(allClaspCodes);
                }
            });
        })
        .catch(error => {
            console.error('Could not load or parse clasp_codes.csv:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Could not load clasp codes.</td></tr>';
        });

    function renderTable(codes) {
        tableBody.innerHTML = '';
        const groupedCodes = codes.reduce((acc, code) => {
            const key = `${code.brand}|${code.model}|${code.reference_number}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(code);
            return acc;
        }, {});

        for (const key in groupedCodes) {
            const group = groupedCodes[key];
            const groupSize = group.length;

            const sanitize = (str) => (str || '').replace(/\n/g, '<br>');

            group.forEach((code, index) => {
                const row = document.createElement('tr');
                if (index === 0) {
                    row.classList.add('group-start');
                }

                const rowspan = (index === 0 && groupSize > 1) ? `rowspan="${groupSize}"` : '';

                if (index === 0) {
                    row.innerHTML = `
                        <td data-label="Brand" ${rowspan}>${code.brand}</td>
                        <td data-label="Model" ${rowspan}>${code.model}</td>
                        <td data-label="Reference" ${rowspan}>${code.reference_number}</td>
                        <td data-label="Size (mm)" ${rowspan}>${code.size_mm}</td>
                        <td data-label="Factory">${sanitize(code.factory)}</td>
                        <td data-label="Serial Number">${sanitize(code.serial_number)}</td>
                        <td data-label="Clasp Code">${sanitize(code.clasp_code)}</td>
                        <td data-col="variations" ${rowspan}>
                            <div class="mobile-variations">
                                <table class="variations-table">
                                    <thead><tr><th>Factory</th><th>Serial Number</th><th>Clasp Code</th></tr></thead>
                                    <tbody>${group.map(c => `<tr><td>${sanitize(c.factory)}</td><td>${sanitize(c.serial_number)}</td><td>${sanitize(c.clasp_code)}</td></tr>`).join('')}</tbody>
                                </table>
                            </div>
                        </td>
                    `;
                } else {
                    row.innerHTML = `
                        <td data-label="Factory">${sanitize(code.factory)}</td>
                        <td data-label="Serial Number">${sanitize(code.serial_number)}</td>
                        <td data-label="Clasp Code">${sanitize(code.clasp_code)}</td>
                    `;
                }
                tableBody.appendChild(row);
            });
        }
    }

    function applyFilters() {
        const searchValue = searchInput.value.toLowerCase();
        const filteredCodes = allClaspCodes.filter(code => {
            return searchValue === '' ||
                Object.values(code).some(val =>
                    String(val).toLowerCase().includes(searchValue)
                );
        });
        renderTable(filteredCodes);
    }

    searchInput.addEventListener('input', applyFilters);
    clearFiltersButton.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
    });
});
