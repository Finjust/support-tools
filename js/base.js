function openNav() {
    document.getElementById("sidebar").style.width = "320px";
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
}

function toggleDropdown(event) {
    // Получаем элемент выпадающего списка
    var dropdownContent = event.currentTarget.querySelector('.dropdown-content');
    var arrow = event.currentTarget.querySelector('.arrow');

    // Переключаем видимость выпадающего списка
    if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
        arrow.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
        `;
    } else {
        dropdownContent.style.display = "block";
        arrow.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
            </svg>
        `;
    }
}
