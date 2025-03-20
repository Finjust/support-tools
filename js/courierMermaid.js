document.addEventListener('DOMContentLoaded', function () {
    const endDateInput = document.getElementById('end_date');
    const startDateInput = document.getElementById('start_date');

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    endDateInput.value = formatDate(today);
    startDateInput.value = formatDate(sevenDaysAgo);

    if (typeof flatpickr !== 'undefined') {
        flatpickr(startDateInput, {
            dateFormat: 'Y-m-d',
            defaultDate: sevenDaysAgo,
            maxDate: today
        });

        flatpickr(endDateInput, {
            dateFormat: 'Y-m-d',
            defaultDate: today,
            maxDate: today
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    function processMermaidText() {
        const svgTexts = document.querySelectorAll('.mermaid svg text');
        svgTexts.forEach((text) => {
            const originalText = text.textContent;
            const index = originalText.indexOf('id_event:');

            if (index !== -1) {
                text.setAttribute('data-original-text', originalText);

                // Обрезка текста до "id_event:"
                const truncatedText = originalText.substring(0, index).trim();

                // Очистка текущего содержимого
                text.innerHTML = '';

                // Обработка даты только один раз
                const dateTimeMatch = truncatedText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
                let finalTextContent = truncatedText; // Начинаем с обрезанного текста

                // Если дата найдена, заменяем её на отформатированную
                if (dateTimeMatch) {
                    const dateTime = dateTimeMatch[0];
                    const formattedDateTime = dateTime.replace('T', ' ').replace('Z', '');

                    // Заменяем дату в тексте
                    finalTextContent = finalTextContent.replace(dateTime, `<tspan style="font-weight: bold; font-size: 15pt; fill: blue;">${formattedDateTime}</tspan>`);
                }

                // Проверка и подсветка слова "warn"
                const warnMatch = truncatedText.match(/\bwarn\b/);
                if (warnMatch) {
                    finalTextContent = finalTextContent.replace(
                        warnMatch[0],
                        `<tspan style="fill: red;">${warnMatch[0]}</tspan>`
                    );
                }

                const errorMatch = truncatedText.match(/\berror\b/);
                if (errorMatch) {
                    finalTextContent = finalTextContent.replace(
                        errorMatch[0],
                        `<tspan style="fill: red;">${errorMatch[0]}</tspan>`
                    );
                }

                // Проверяем наличие знака "-"
                if (!finalTextContent.includes(' - ')) {
                    // Добавляем маркер и подсвечиваем красным, если нет знака "-"
                    finalTextContent = `<tspan style="fill: red; font-weight: bold;">!!!</tspan> ${finalTextContent}`;
                }

                // Добавляем обновлённый текст в элемент
                text.innerHTML = finalTextContent;

                // Добавляем события
                addTextEvents(text);
            }
        });
    }

    function addTextEvents(textElement) {
        // Настройка курсора и событий
        textElement.style.cursor = 'pointer';

        textElement.addEventListener('mouseenter', () => {
            textElement.style.textDecoration = 'underline';
        });

        textElement.addEventListener('mouseleave', () => {
            textElement.style.textDecoration = 'none';
        });

        textElement.addEventListener('click', () => handleTextClick(textElement));
    }

    // Наблюдатель за изменениями в DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const mermaidSvg = document.querySelector('.mermaid svg');
                if (mermaidSvg) {
                    setTimeout(processMermaidText, 100); // Даем немного времени на рендер
                }
            }
        });
    });

    // Запуск наблюдателя
    const mermaidContainer = document.querySelector('.mermaid');
    if (mermaidContainer) {
        observer.observe(mermaidContainer, { childList: true, subtree: true });
    }
});


// Функция для обработки клика по тексту
function handleTextClick(textElement) {
    const originalText = textElement.getAttribute('data-original-text');

    if (originalText) {
        const idPart = originalText.match(/id_event:(.*)$/)?.[1];

        if (idPart) {
            const orderId = document.getElementById('order_id').value;

            sendEventToServer(`${idPart},${orderId}`)
                .then(serverResponse => {
                    showBootstrapModal(serverResponse);
                })
                .catch(error => {
                    console.error('Error sending data:', error);
                    showBootstrapModal({ code: 'Ошибка', data: 'Не удалось получить данные.' });
                });
        }
    }
}

// Функция для отправки данных на сервер
function sendEventToServer(dataString) {

    return fetch('/courier/mermaid/send-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: dataString,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json(); // Получаем ответ как JSON
        })
        .catch(error => {
            console.error('Error sending data:', error);
            throw error;
        });
}

// Функция для показа модального окна Bootstrap
function showBootstrapModal(responseData) {
    const { code, data } = responseData;

    // Если уже есть модальное окно, удаляем его
    const existingModal = document.getElementById('eventModal');
    if (existingModal) {
        existingModal.remove(); // Удаляем старое модальное окно
    }

    // Создаем новое модальное окно
    const modalHtml = `
        <div class="modal fade" id="eventModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-scrollable"> <!-- Классы для больших окон -->
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Информация о запросе: ${code}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; height: 80vh;"> <!-- Настройка высоты -->
                        <!-- Контейнер для CodeMirror -->
                        <div id="jsonEditorContainer" style="flex: 1;"></div> <!-- Занимает всю доступную высоту -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Показываем модальное окно
    const modalElement = document.getElementById('eventModal');
    const modal = new bootstrap.Modal(modalElement);

    // Дожидаемся полного отображения модального окна
    modalElement.addEventListener('shown.bs.modal', () => {
        const jsonEditorContainer = document.getElementById('jsonEditorContainer');
        if (jsonEditorContainer) {
            try {
                // Первый парсинг: преобразуем строку JSON в объект
                const parsedString = JSON.parse(data); // Распарсим строку как JSON

                // Второй парсинг: преобразуем содержимое строки в объект
                const parsedData = JSON.parse(parsedString); // Преобразуем внутренний JSON в объект

                // Рекурсивная функция для преобразования строк в JSON
                function parseNestedStrings(obj) {
                    if (typeof obj === 'object' && obj !== null) {
                        for (const key in obj) {
                            if (typeof obj[key] === 'string') {
                                try {
                                    // Пытаемся распарсить строку как JSON
                                    obj[key] = JSON.parse(obj[key]);
                                } catch (e) {
                                    // Если это не JSON, оставляем как есть
                                }
                            } else if (typeof obj[key] === 'object') {
                                // Рекурсивно обрабатываем вложенные объекты и массивы
                                parseNestedStrings(obj[key]);
                            }
                        }
                    }
                }

                // Применяем рекурсивное преобразование ко всем данным
                parseNestedStrings(parsedData);

                // Форматируем JSON для отображения
                const formattedData = JSON.stringify(parsedData, null, 2);

                // Инициализация CodeMirror
                const editor = CodeMirror(jsonEditorContainer, {
                    value: formattedData, // Устанавливаем форматированные JSON-данные
                    mode: 'application/json', // Подсветка синтаксиса JSON
                    theme: 'dracula', // Тема оформления редактора
                    lineNumbers: true, // Включение номеров строк
                    foldGutter: true, // Включение сворачивания кода
                    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'], // Гуттеры для номеров строк и сворачивания
                    matchBrackets: true, // Подсветка парных скобок
                    lineWrapping: true, // Автоперенос строк
                    readOnly: true, // Режим только для чтения
                    autoRefresh: true, // Автоматическое обновление содержимого
                    extraKeys: { "Ctrl-F": "findPersistent" }, // Добавляем горячие клавиши для поиска
                });

                // Программное обновление данных в CodeMirror (если нужно)
                editor.setValue(formattedData); // Устанавливаем новые данные

                // Устанавливаем высоту CodeMirror равной высоте контейнера
                editor.setSize(null, jsonEditorContainer.clientHeight);
            } catch (error) {
                // Если данные некорректны, отображаем их как есть
                CodeMirror(jsonEditorContainer, {
                    value: data, // Отображаем данные как есть
                    mode: 'text/plain', // Отключаем подсветку синтаксиса
                    theme: 'dracula',
                    lineNumbers: true,
                    readOnly: true,
                    autoRefresh: true
                });
            }
        }
    });

    // Показываем модальное окно
    modal.show();
}
