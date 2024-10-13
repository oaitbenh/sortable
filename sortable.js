let heroes = [];
let filteredHeroes = [];
let currentPage = 1;
let pageSize = 20;
let currentSort = { column: 'name', order: 'asc' };

const tableBody = document.querySelector('#heroTable tbody');
const searchInput = document.getElementById('search');
const pageSizeSelect = document.getElementById('pageSize');
const paginationDiv = document.getElementById('pagination');

fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(loadData);

function loadData(data) {
    heroes = data;
    console.log(heroes[0]);
    filteredHeroes = [...heroes];
    sortHeroes();
    renderTable();
    setupEventListeners();
}

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', handlePageSizeChange);
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
    currentPage = 1;
    renderTable();
}

function handlePageSizeChange() {
    pageSize = pageSizeSelect.value === 'all' ? filteredHeroes.length : parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderTable();
}

function handleSort(column) {
    console.log(column);
    if (currentSort.column === column) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort = { column, order: 'asc' };
    }
    sortHeroes();
    renderTable();
}

function sortHeroes() {
    const { column, order } = currentSort;
    filteredHeroes.sort((a, b) => {
        let valueA, valueB;
        if (column === 'name') {
            valueA = a.name ;
            valueB = b.name ;
        }else if (column === 'fullName') {
            valueA = a['biography'].fullName ;
            valueB = b['biography'].fullName  ;
        }else if (column === 'race' || column === 'gender') {
            valueA = a.appearance[column] ;
            valueB = b.appearance[column] ;
        } else if (column === 'height' || column === 'weight') {
            valueA = parseFloat(a.appearance[column][0]) || 0;
            valueB = parseFloat(b.appearance[column][0]) || 0;
        } else if (column === 'placeOfBirth' || column === 'alignment') {
            valueA = a.biography[column] ;
            valueB = b.biography[column] ;
        } else if (column === 'powerstats') {
            valueA = a.powerstats.intelligence + a.powerstats.strength + a.powerstats.speed + a.powerstats.power + a.powerstats.combat + a.powerstats.durability;
            valueB = b.powerstats.intelligence + b.powerstats.strength + b.powerstats.speed + b.powerstats.power + b.powerstats.combat + b.powerstats.durability ;
        }
        if (valueA == '-' || valueA === '' || valueA === null) return 1;
        if (valueB == '-' || valueB === '' || valueB === null) return -1;

        if (typeof valueA === 'string') {
            return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else {
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }
    });
}

function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageHeroes = filteredHeroes.slice(start, end);

    tableBody.innerHTML = pageHeroes.map(hero => `
                <tr>
                    <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
                    <td>${hero.name}</td>
                    <td>${hero.biography.fullName }</td>
                    <td>${formatPowerstats(hero.powerstats)}</td>
                    <td>${hero.appearance.race }</td>
                    <td>${hero.appearance.gender }</td>
                    <td>${hero.appearance.height[1] }</td>
                    <td>${hero.appearance.weight[1] }</td>
                    <td>${hero.biography.placeOfBirth }</td>
                    <td>${hero.biography.alignment }</td>
                </tr>
            `).join('');

    renderPagination();
}

function formatPowerstats(stats) {
    return Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join(', ');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredHeroes.length / pageSize);
    let paginationHTML = '';

    if (totalPages > 1) {
        paginationHTML += `<button onclick="changePage(1)">First</button>`;
        paginationHTML += `<button onclick="changePage(${Math.max(1, currentPage - 1)})">Previous</button>`;

        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
        }

        paginationHTML += `<button onclick="changePage(${Math.min(totalPages, currentPage + 1)})">Next</button>`;
        paginationHTML += `<button onclick="changePage(${totalPages})">Last</button>`;
    }

    paginationDiv.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    renderTable();
}
