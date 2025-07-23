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

            const cellName = document.createElement('td');
            cellName.dataset.label = 'Dealer Name';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = dealer.name;
            cellName.appendChild(nameSpan);
            row.appendChild(cellName);

            const cellWebsite = document.createElement('td');
            cellWebsite.dataset.label = 'Website';
            const websiteSpan = document.createElement('span');
            websiteSpan.innerHTML = `<a href="${dealer.website}" target="_blank">${dealer.website}</a>`;
            cellWebsite.appendChild(websiteSpan);
            row.appendChild(cellWebsite);

            const cellContact = document.createElement('td');
            cellContact.dataset.label = 'Contact Method';
            const contactSpan = document.createElement('span');
            contactSpan.textContent = dealer.contact;
            cellContact.appendChild(contactSpan);
            row.appendChild(cellContact);

            const cellNotes = document.createElement('td');
            cellNotes.dataset.label = 'Notes';
            const notesSpan = document.createElement('span');
            notesSpan.textContent = dealer.notes;
            cellNotes.appendChild(notesSpan);
            row.appendChild(cellNotes);

            tableBody.appendChild(row);
        });
    }
});
