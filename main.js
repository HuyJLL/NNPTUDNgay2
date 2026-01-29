const API_URL = 'https://raw.githubusercontent.com/HuyJLL/NNPTUDNgay2/main/db.json';
const ITEMS_PER_PAGE = 10;

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let currentSort = {
    column: 'default',
    order: 'asc'
};

async function loadProducts() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('product-table-body');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];

        if (loading) loading.style.display = 'none';

        renderPage();

    } catch (error) {
        console.error(error);
        if (loading) loading.style.display = 'none';
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    }
}

function renderTable(products) {
    const tableBody = document.getElementById('product-table-body');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Không tìm thấy sản phẩm nào</td></tr>';
        return;
    }

    products.forEach(item => {
        let imgUrl = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/60?text=No+Img';
        
        if(imgUrl.startsWith('["')) {
            imgUrl = imgUrl.replace('["', '').replace('"]', '');
        }

        const categoryName = item.category ? item.category.name : 'Uncategorized';
        
        let shortDesc = item.description || '';
        if (shortDesc.length > 60) shortDesc = shortDesc.substring(0, 60) + '...';

        const row = `
            <tr>
                <td class="ps-3 fw-bold text-secondary">#${item.id}</td>
                <td>
                    <img src="${imgUrl}" 
                         class="table-img" 
                         alt="${item.title}" 
                         referrerpolicy="no-referrer"
                         onerror="this.onerror=null; this.src='https://placehold.co/60?text=Err';">
                </td>
                <td class="fw-bold" style="color: #09637E;">${item.title}</td>
                <td><span class="badge badge-custom">${categoryName}</span></td>
                <td class="fw-bold" style="color: #088395;">$${item.price}</td>
                <td class="text-muted small">${shortDesc}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return;

    const prevClass = currentPage === 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${prevClass}">
            <a class="page-link" onclick="changePage(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></a>
        </li>
    `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) paginationContainer.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationContainer.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationContainer.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        paginationContainer.innerHTML += `<li class="page-item"><a class="page-link" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }

    const nextClass = currentPage === totalPages ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${nextClass}">
            <a class="page-link" onclick="changePage(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></a>
        </li>
    `;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderPage();
}

function renderPage() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = filteredProducts.slice(start, end);

    renderTable(paginatedItems);
    renderPagination();
}

function toggleSort(column) {
    if (currentSort.column === column) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.order = 'asc';
    }

    updateSortUI();
    processData();
}

function updateSortUI() {
    const btnName = document.getElementById('btn-sort-name');
    const btnPrice = document.getElementById('btn-sort-price');

    btnName.className = 'btn btn-outline-secondary fw-bold';
    btnName.innerHTML = 'Tên <i class="fa-solid fa-sort ms-1"></i>';
    
    btnPrice.className = 'btn btn-outline-secondary fw-bold';
    btnPrice.innerHTML = 'Giá <i class="fa-solid fa-sort ms-1"></i>';

    const iconClass = currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    
    if (currentSort.column === 'name') {
        btnName.className = 'btn btn-info text-white fw-bold';
        btnName.innerHTML = `Tên <i class="fa-solid ${iconClass} ms-1"></i>`;
    } 
    else if (currentSort.column === 'price') {
        btnPrice.className = 'btn btn-info text-white fw-bold';
        btnPrice.innerHTML = `Giá <i class="fa-solid ${iconClass} ms-1"></i>`;
    }
}

function processData() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    filteredProducts = allProducts.filter(p => 
        p.title && p.title.toLowerCase().includes(searchTerm)
    );

    if (currentSort.column === 'name') {
        filteredProducts.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (currentSort.order === 'asc') return titleA.localeCompare(titleB);
            else return titleB.localeCompare(titleA);
        });
    } 
    else if (currentSort.column === 'price') {
        filteredProducts.sort((a, b) => {
            if (currentSort.order === 'asc') return a.price - b.price;
            else return b.price - a.price;
        });
    }

    currentPage = 1;
    renderPage();
}

document.addEventListener('DOMContentLoaded', loadProducts);