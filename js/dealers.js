document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#dealers-table tbody');

    fetch('data/dealers.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    renderDealers(results.data);
                }
            });
        })
        .catch(error => {
            console.error('Could not load or parse dealers.csv:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Could not load dealer information.</td></tr>';
        });

    function renderDealers(dealers) {
        tableBody.innerHTML = '';
        dealers.forEach(dealer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dealer.name}</td>
                <td><a href="${dealer.website}" target="_blank">${dealer.website}</a></td>
                <td>${dealer.contact}</td>
                <td>${dealer.notes}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});
