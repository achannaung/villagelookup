class VillageSearchApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.searchInput = document.getElementById('searchInput');
        this.clearBtn = document.getElementById('clearBtn');
        this.tableBody = document.getElementById('tableBody');
        this.resultCount = document.getElementById('resultCount');
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.displayData(this.data);
        this.updateResultCount(this.data.length);
    }

    async loadData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/achannaung/Datasets/main/Villages_HZ.csv');
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            console.log('Data loaded successfully:', this.data.length, 'records');
        } catch (error) {
            console.error('Error loading data:', error);
            this.resultCount.textContent = 'Error loading data. Please try again later.';
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index].trim();
                });
                data.push(row);
            }
        }
        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.clearBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.displayData(this.data);
            this.updateResultCount(this.data.length);
            this.searchInput.focus();
        });

        // Enter key support
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.displayData(this.data);
            this.updateResultCount(this.data.length);
            return;
        }

        const filtered = this.data.filter(row => {
            const township = row.Township || '';
            return township.toLowerCase().includes(searchTerm.toLowerCase().trim());
        });

        this.filteredData = filtered;
        this.displayData(filtered);
        this.updateResultCount(filtered.length);
    }

    displayData(data) {
        if (data.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-results">
                        ${this.searchInput.value.trim() ? 'No villages found for the specified township.' : 'No data available.'}
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = data.map(row => `
            <tr>
                <td>${row['No.'] || ''}</td>
                <td>${row['SR'] || ''}</td>
                <td><strong>${row['Township'] || ''}</strong></td>
                <td>${row['Village'] || ''}</td>
                <td>${row['Village_MM'] || ''}</td>
                <td>${row['Location'] || ''}</td>
                <td>${row['Locals_Used_ENG'] || ''}</td>
                <td>${row['Locals_Used_MM'] || ''}</td>
            </tr>
        `).join('');
    }

    updateResultCount(count) {
        const searchTerm = this.searchInput.value.trim();
        if (searchTerm) {
            this.resultCount.textContent = `Found ${count} village${count !== 1 ? 's' : ''} in "${searchTerm}" township`;
        } else {
            this.resultCount.textContent = `Showing all ${count} villages`;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VillageSearchApp();
});
