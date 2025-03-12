document.addEventListener('click', function (event) {
    const icon = event.target.closest('.clickable-icon');
    if (icon) {
        const photo = icon.getAttribute('data-photo');
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            modalImage.src = photo;
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

function copyText() {
    let text = '';
    const resultCards = document.querySelectorAll('#results .card');

    if (resultCards.length === 0) {
        alert('Нет данных для копирования.');
        return;
    }

    resultCards.forEach(card => {
        // Извлекаем данные о заказе
        const orderIDElement = card.querySelector('li:nth-of-type(1)');
        const externalIDElement = card.querySelector('li:nth-of-type(2)');
        const formattedDateElement = card.querySelector('li:nth-of-type(3)');
        const sapIDElement = card.querySelector('li:nth-of-type(4)');
        const addressElement = card.querySelector('li:nth-of-type(5)');
        const shopGroupElement = card.querySelector('li:nth-of-type(6)');

        const orderID = extractText(orderIDElement, 'ID заказа:');
        const externalID = extractText(externalIDElement, 'Внешний ID:');
        const formattedDate = extractText(formattedDateElement, 'Дата создания:');
        const sapID = extractText(sapIDElement, 'SAP ID:');
        const address = extractText(addressElement, 'Адрес:');
        const shopGroup = extractText(shopGroupElement, 'Сеть:');

        // Формируем информацию о заказе
        text += `ID заказа: ${orderID}\n`;
        text += `Внешний ID: ${externalID}\n`;
        text += `Дата создания: ${formattedDate}\n`;
        text += `SAP ID: ${sapID}\n`;
        text += `Адрес: ${address}\n`;
        text += `Сеть: ${shopGroup}\n`;

        // Обрабатываем товары
        const productRows = card.querySelectorAll('table tbody tr');
        productRows.forEach(row => {
            const checkbox = row.querySelector('.product-checkbox');
            if (!checkbox || !checkbox.checked) return; // Копируем только отмеченные товары

            const pluElement = row.querySelector('td:nth-of-type(2) a'); // PLU
            const productIdElement = row.querySelector('td:nth-of-type(3)'); // ID товара
            const quantityElement = row.querySelector('td:nth-of-type(4)'); // Кол-во в заказе
            const commentInput = row.querySelector('.comment-input'); // Комментарий

            const plu = pluElement ? pluElement.textContent.trim() : 'Не указан';
            const productId = productIdElement ? productIdElement.textContent.replace('ID:', '').trim() : 'Не указан';
            const quantity = quantityElement ? quantityElement.textContent.replace('Кол-во в заказе:', '').trim() : 0;
            const comment = commentInput ? commentInput.value.trim() : '';

            // Формируем информацию о товаре
            text += `PLU: ${plu} ID: ${productId} Кол-во в заказе: ${quantity} ${comment}\n`;
        });

        // Добавляем пустую строку между заказами
        text += '\n';
    });

    // Если ничего не выбрано, показываем сообщение
    if (text.trim() === '') {
        alert('Выберите хотя бы один товар.');
        return;
    }

    // Копируем текст в буфер обмена
    navigator.clipboard.writeText(text).then(() => {
        alert('Текст успешно скопирован!');
    }).catch(err => {
        console.error('Ошибка копирования текста:', err);
        alert('Произошла ошибка при копировании.');
    });
}

// Вспомогательная функция для извлечения текста без лишних пробелов
function extractText(element, prefix) {
    if (!element) return 'Не указано';
    const rawText = element.textContent.trim();
    return rawText.replace(prefix, '').trim(); // Убираем префикс и пробелы
}

function openRedashQuery(article, stock, formattedDate, quantity) {
    // Очищаем входную строку от лишних символов (например, запятых)
    formattedDate = formattedDate.replace(/,/g, ''); // Удаляем все запятые

    // Разделяем дату и время (если они есть)
    let datePart = formattedDate;
    let timePart = ''; // По умолчанию время пустое

    if (formattedDate.includes(' ')) {
        [datePart, timePart] = formattedDate.split(' ');
    }

    // Преобразуем дату из формата ДД.ММ.ГГГГ в ГГГГ-ММ-ДД
    const dateParts = datePart.split('.');
    if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        datePart = `${year}-${month}-${day}`;
    }

    // Объединяем дату и время в правильном формате
    const formattedDateTime = timePart ? `${datePart} ${timePart}` : datePart;

    // Продолжаем формирование URL
    const fixedQuantity = quantity.replace(',', '.');
    const encodedArticle = encodeURIComponent(article);
    const encodedStock = encodeURIComponent(stock);
    const encodedFormattedDate = encodeURIComponent(formattedDateTime);
    const encodedQuantity = encodeURIComponent(fixedQuantity);

    const url = `https://pvm-infra-redash.x5food.tech/queries/202/source?p_article=${encodedArticle}&p_stock=${encodedStock}&p_date=${encodedFormattedDate}&p_quantity=${encodedQuantity}`;
    window.open(url, '_blank');
}
