document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация приложения
    const CONFIG = {
        pdfSettings: {
            logo: null, // './img/logo.png' если есть лого
            theme: 'default',
            language: 'ru'
        }
    };

    // Данные о самолетах
    const AIRCRAFTS = [
        {
            name: "Sukhoi Superjet 100",
            regNumber: "RA-89011",
            maxWeight: "45.9 тонн",
            range: "3048 км",
            passengers: "98",
            description: "Основной российский ближнемагистральный лайнер",
            image: "./img/Sukhoi_Superjet.jpg",
            baseRunway: 1800
        },
        {
            name: "Irkut MC-21-300",
            regNumber: "RA-73651",
            maxWeight: "79.2 тонны",
            range: "6000 км",
            passengers: "211",
            description: "Новейший российский авиалайнер",
            image: "./img/Irkut_MC-21-300.webp",
            baseRunway: 2200
        },
        {
            name: "Ил-96-300",
            regNumber: "RA-96018",
            maxWeight: "250 тонн",
            range: "11500 км",
            passengers: "300",
            description: "Флагманский дальнемагистральный самолёт",
            image: "./img/Il-96-300.jpg",
            baseRunway: 3000
        },
        {
            name: "Ту-214",
            regNumber: "RA-64501",
            maxWeight: "110.8 тонн",
            range: "6500 км",
            passengers: "210",
            description: "Среднемагистральный пассажирский самолёт",
            image: "./img/Tu-214.jpg",
            baseRunway: 2500
        },
        {
            name: "Як-42",
            regNumber: "RA-42430",
            maxWeight: "57.5 тонн",
            range: "2900 км",
            passengers: "120",
            description: "Надёжный региональный лайнер",
            image: "./img/Yak-42.jpg",
            baseRunway: 2000
        },
        {
            name: "Ан-148",
            regNumber: "RA-61708",
            maxWeight: "43.7 тонн",
            range: "2200 км",
            passengers: "85",
            description: "Компактный региональный самолёт",
            image: "./img/An-148.jpg",
            baseRunway: 1700
        }
    ];

    // DOM элементы
    const grid = document.getElementById('aircraftGrid');
    const calcModal = document.getElementById('calcModal');
    const resultModal = document.getElementById('resultModal');
    const resultData = document.getElementById('resultData');
    const calcForm = document.getElementById('calcForm');

    // Инициализация приложения
    function init() {
        initAircraftGrid();
        setupModalHandlers();
        setupFormHandler();
    }

    // Инициализация сетки самолетов
    function initAircraftGrid() {
        if (grid) {
            grid.innerHTML = '';
        } else {
            console.error('Элемент #aircraftGrid не найден!');
            const newGrid = document.createElement('div');
            newGrid.id = 'aircraftGrid';
            newGrid.className = 'aircraft-grid';
            document.querySelector('.catalog').appendChild(newGrid);
        }
        
        const targetGrid = grid || document.getElementById('aircraftGrid');
        
        AIRCRAFTS.forEach(aircraft => {
            targetGrid.appendChild(createAircraftCard(aircraft));
        });
    }

    // Создание карточки самолета
    function createAircraftCard(aircraft) {
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        
        card.innerHTML = `
            <div class="aircraft-image">
                ${aircraft.image ? 
                    `<img src="${aircraft.image}" alt="${aircraft.name}" 
                        onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\'image-placeholder\'>${aircraft.name}</div>'">` :
                    `<div class="image-placeholder">${aircraft.name}</div>`
                }
            </div>
            <div class="aircraft-info">
                <h3 class="aircraft-title">${aircraft.name}</h3>
                <div class="specs-grid">
                    <div class="spec-label">Бортовой номер:</div>
                    <div class="spec-value">${aircraft.regNumber}</div>
                    <div class="spec-label">Макс. взлётный вес:</div>
                    <div class="spec-value">${aircraft.maxWeight}</div>
                    <div class="spec-label">Дальность полёта:</div>
                    <div class="spec-value">${aircraft.range}</div>
                    <div class="spec-label">Пассажировместимость:</div>
                    <div class="spec-value">${aircraft.passengers}</div>
                </div>
                <p class="aircraft-description">${aircraft.description}</p>
                <button class="select-btn">Выбрать для расчётов</button>
            </div>
        `;
        
        return card;
    }

    // Настройка обработчиков модальных окон
    function setupModalHandlers() {
        // Выбор самолета
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('select-btn')) {
                handleAircraftSelect(e.target);
            }
        });

        // Закрытие модальных окон
        document.getElementById('closeCalcModal').addEventListener('click', closeCalcModal);
        document.getElementById('closeResultModal').addEventListener('click', closeResultModal);
        document.getElementById('cancelCalc').addEventListener('click', closeCalcModal);

        // Закрытие по клику вне окна
        window.addEventListener('click', function(e) {
            if (e.target === calcModal) closeCalcModal();
            if (e.target === resultModal) closeResultModal();
        });
    }

    function handleAircraftSelect(button) {
        const card = button.closest('.aircraft-card');
        const aircraftTitle = card.querySelector('.aircraft-title').textContent;
        const regNumber = card.querySelector('.spec-value').textContent;
        
        fillFormWithAircraftData(aircraftTitle, regNumber);
        openCalcModal();
    }

    function fillFormWithAircraftData(aircraftTitle, regNumber) {
        document.getElementById('aircraftType').value = aircraftTitle;
        document.getElementById('registrationNumber').value = regNumber;
        
        const now = new Date();
        document.getElementById('flightDate').valueAsDate = now;
        document.getElementById('flightTime').value = 
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    function openCalcModal() {
        calcModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCalcModal() {
        calcModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function closeResultModal() {
        resultModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Обработка формы расчетов
    function setupFormHandler() {
        calcForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = collectFormData();
            const results = calculateResults(formData);
            
            showResults(formData, results);
            closeCalcModal();
        });
    }

    function collectFormData() {
        return {
            aircraftType: getValue('aircraftType'),
            flightNumber: getValue('flightNumber'),
            registrationNumber: getValue('registrationNumber'),
            flightDate: getValue('flightDate'),
            flightTime: getValue('flightTime'),
            airportName: getValue('airportName'),
            icaoCode: getValue('icaoCode'),
            airportElevation: getValue('airportElevation'),
            latitude: getValue('latitude'),
            longitude: getValue('longitude'),
            temperature: getValue('temperature'),
            qnh: getValue('qnh'),
            windDirection: getValue('windDirection'),
            windSpeed: getValue('windSpeed'),
            runway: getValue('runway'),
            runwayCondition: getValue('runwayCondition'),
            weight: getValue('weight'),
            flaps: getValue('flaps'),
            antiice: getValue('antiice')
        };
    }

    function getValue(id) {
        return document.getElementById(id).value;
    }

    // Расчет результатов (упрощенный пример)
    function calculateResults(formData) {
        const aircraft = AIRCRAFTS.find(a => a.name === formData.aircraftType) || {};
        let requiredRunway = aircraft.baseRunway || 2000;

        // Корректировки на условия
        if (formData.runwayCondition === 'wet') requiredRunway *= 1.15;
        if (formData.runwayCondition === 'snow') requiredRunway *= 1.3;
        if (formData.runwayCondition === 'ice') requiredRunway *= 1.5;
        if (parseInt(formData.temperature) > 25) requiredRunway += (formData.temperature - 25) * 10;
        if (parseInt(formData.windSpeed) < 5) requiredRunway += 100;

        return {
            requiredRunway: `${Math.round(requiredRunway)} м`,
            weightStatus: checkWeight(formData),
            recommendedConfig: recommendConfiguration(formData),
            notes: generateNotes(formData)
        };
    }

    function checkWeight(formData) {
        const weight = parseInt(formData.weight);
        if (weight > 80000) return 'Превышение максимальной массы';
        if (weight > 70000) return 'Предельная масса';
        return 'В норме';
    }

    function recommendConfiguration(formData) {
        let config = `Закрылки ${formData.flaps}°`;
        
        if (formData.runwayCondition === 'wet' || formData.runwayCondition === 'snow') {
            config += ', реверс';
        }
        
        if (parseInt(formData.temperature) > 30) {
            config += ', уменьшенная тяга';
        }
        
        return config;
    }

    function generateNotes(formData) {
        const notes = [];
        
        if (formData.runwayCondition === 'ice') {
            notes.push('Требуется дополнительная проверка ВПП');
        }
        
        if (parseInt(formData.windSpeed) > 15) {
            notes.push('Сильный боковой ветер - будьте осторожны');
        }
        
        return notes.length ? notes.join('; ') : 'Условия в пределах нормы';
    }

    // Отображение результатов
    function showResults(formData, results) {
        displayResultsInModal(formData, results);
        setupPdfDownload(formData, results);
        openResultModal();
    }

    function displayResultsInModal(formData, results) {
        resultData.innerHTML = `
            <div class="result-section">
                <h4>Входные данные:</h4>
                <table>
                    <tr><th>Тип ВС:</th><td>${formData.aircraftType}</td></tr>
                    <tr><th>Бортовой номер:</th><td>${formData.registrationNumber}</td></tr>
                    <tr><th>Аэродром:</th><td>${formData.airportName} (${formData.icaoCode})</td></tr>
                    <tr><th>Дата/время:</th><td>${formData.flightDate} ${formData.flightTime}</td></tr>
                </table>
            </div>
            <div class="result-section">
                <h4>Результаты расчета:</h4>
                <table>
                    <tr><th>Требуемая длина ВПП:</th><td>${results.requiredRunway}</td></tr>
                    <tr><th>Превышение массы:</th><td>${results.weightStatus}</td></tr>
                    <tr><th>Рекомендуемая конфигурация:</th><td>${results.recommendedConfig}</td></tr>
                    <tr><th>Примечания:</th><td>${results.notes}</td></tr>
                </table>
            </div>
        `;
    }

    function setupPdfDownload(formData, results) {
        document.getElementById('downloadPdf').onclick = function() {
            try {
                const pdfGenerator = new PdfGenerator(CONFIG.pdfSettings);
                const pdfDoc = pdfGenerator.generate(formData, results);
                pdfDoc.save(`Расчет_ВПП_${formData.aircraftType}_${formData.flightDate}.pdf`);
            } catch (error) {
                console.error('Ошибка генерации PDF:', error);
                alert('Не удалось сгенерировать PDF. Проверьте консоль для подробностей.');
            }
        };
    }

    function openResultModal() {
        resultModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Запуск приложения
    init();
});