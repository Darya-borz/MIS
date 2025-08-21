
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация приложения
    const CONFIG = {
        pdfSettings: {
            logo: null,
            theme: 'default',
            language: 'ru'
        }
    };

    // Полные данные о самолетах
    const AIRCRAFTS = [
        {
            name: "Sukhoi Superjet 100",
            regNumber: "RA-89011",
            maxWeight: 45900,
            range: "3048 км",
            passengers: "98",
            description: "Основной российский ближнемагистральный лайнер",
            image: "./img/Sukhoi_Superjet.jpg",
            baseRunway: 1800,
            flapsOptions: [0, 5, 10, 15, 20, 25, 30]
        },
        {
            name: "Irkut MC-21-300",
            regNumber: "RA-73651",
            maxWeight: 79200,
            range: "6000 км",
            passengers: "211",
            description: "Новейший российский авиалайнер",
            image: "./img/Irkut MC-21-300.webp",
            baseRunway: 2200,
            flapsOptions: [0, 5, 10, 15, 20, 25]
        },
        {
            name: "Ил-96-300",
            regNumber: "RA-96018",
            maxWeight: 250000,
            range: "11500 км",
            passengers: "300",
            description: "Флагманский дальнемагистральный самолёт",
            image: "./img/Ил-96-300.jpg",
            baseRunway: 3000,
            flapsOptions: [0, 10, 20, 30]
        }
    ];

    // Стандартные данные аэродромов (резервные)
    const DEFAULT_AERODROMS = [
        {
            NAME_AERO: "MOSCOW/VNUKOVO",
            KOD_ICAO: "UUWW",
            LEV_KTA: 209,
            LAT_DEG: 55.596111,
            LONG_DEG: 37.2675,
            runways: ["06", "24"],
            city: "Москва"
        },
        {
            NAME_AERO: "MOSCOW/SHEREMETYEVO",
            KOD_ICAO: "UUEE",
            LEV_KTA: 190,
            LAT_DEG: 55.972642,
            LONG_DEG: 37.414589,
            runways: ["06L", "06R", "24L", "24R"],
            city: "Москва"
        },
        {
            NAME_AERO: "SAINT-PETERSBURG/PULKOVO",
            KOD_ICAO: "ULLI",
            LEV_KTA: 24,
            LAT_DEG: 59.800292,
            LONG_DEG: 30.262503,
            runways: ["10L", "10R", "28L", "28R"],
            city: "Санкт-Петербург"
        }
    ];

    // DOM элементы
    const elements = {
        grid: document.getElementById('aircraftGrid'),
        calcModal: document.getElementById('calcModal'),
        resultModal: document.getElementById('resultModal'),
        resultData: document.getElementById('resultData'),
        calcForm: document.getElementById('calcForm'),
        airportInput: document.getElementById('airportName'),
        icaoCode: document.getElementById('icaoCode'),
        runwaySelect: document.getElementById('runway'),
        aircraftType: document.getElementById('aircraftType'),
        registrationNumber: document.getElementById('registrationNumber'),
        weight: document.getElementById('weight'),
        flapsSelect: document.getElementById('flaps'),
        antiiceSelect: document.getElementById('antiice'),
        icaoSearchBtn: document.getElementById('icaoSearchBtn')
    };

    // Глобальные переменные
    let ALL_AERODROMES = [];
    let db = null;

    // Инициализация приложения
    async function init() {
        await initDatabase();
        initAircraftGrid();
        setupModalHandlers();
        setupFormHandler();
        setupIcaoAutocomplete();
        setupEventListeners();
    }

    // Инициализация базы данных
    async function initDatabase() {
        try {
            // Загрузка базы данных Aerodrom.sqlite
            const response = await fetch('./db/Aerodrom.sqlite');
            const arrayBuffer = await response.arrayBuffer();
            const UInt8Array = new Uint8Array(arrayBuffer);
            
            // Инициализация SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            
            db = new SQL.Database(UInt8Array);
            
            // Загрузка данных об аэродромах
            loadAerodromesData();
        } catch (error) {
            console.error('Ошибка загрузки базы данных:', error);
            // Используем стандартные данные в случае ошибки
            ALL_AERODROMES = [...DEFAULT_AERODROMS];
        }
    }

    // Загрузка данных об аэродромах из базы данных
    function loadAerodromesData() {
        try {
            // Запрос к таблице AERODROM
            const aerodromStmt = db.prepare(`
                SELECT KOD_ICAO, NAME_AERO, LEV_KTA, LAT_RAD, LONG_RAD 
                FROM AERODROM
            `);
            
            // Запрос к таблице RANWAY для получения данных о ВПП
            const runwayStmt = db.prepare(`
                SELECT KOD_ICAO, NUM_VPP 
                FROM RANWAY
            `);
            
            // Собираем данные о ВПП по кодам ИКАО
            const runwaysByIcao = {};
            while (runwayStmt.step()) {
                const row = runwayStmt.getAsObject();
                const icao = row.KOD_ICAO;
                if (!runwaysByIcao[icao]) {
                    runwaysByIcao[icao] = [];
                }
                runwaysByIcao[icao].push(row.NUM_VPP);
            }
            
            // Собираем данные об аэродромах
            ALL_AERODROMES = [];
            while (aerodromStmt.step()) {
                const row = aerodromStmt.getAsObject();
                
                // Преобразуем координаты из радиан в градусы
                const latDeg = row.LAT_RAD * (180 / Math.PI);
                const longDeg = row.LONG_RAD * (180 / Math.PI);
                
                ALL_AERODROMES.push({
                    NAME_AERO: row.NAME_AERO,
                    KOD_ICAO: row.KOD_ICAO,
                    LEV_KTA: row.LEV_KTA,
                    LAT_DEG: latDeg,
                    LONG_DEG: longDeg,
                    runways: runwaysByIcao[row.KOD_ICAO] || [],
                    city: row.NAME_AERO.split('/')[0] // Извлекаем город из названия
                });
            }
            
            aerodromStmt.free();
            runwayStmt.free();
            console.log('Загружено аэродромов:', ALL_AERODROMES.length);
        } catch (error) {
            console.error('Ошибка выполнения запроса к базе данных:', error);
            ALL_AERODROMES = [...DEFAULT_AERODROMS];
        }
    }

    // Поиск аэродрома по коду ИКАО
    function findAerodromByIcao(icaoCode) {
        return ALL_AERODROMES.find(a => a.KOD_ICAO === icaoCode);
    }

    // Поиск аэродромов по частичному совпадению кода ИКАО
    function findAerodromsByPartialIcao(partialIcao) {
        const term = partialIcao.toUpperCase();
        return ALL_AERODROMES.filter(a => a.KOD_ICAO.includes(term));
    }

    // Поиск ВС по типу
    function findAircraftByType(type) {
        return AIRCRAFTS.find(a => a.name.toLowerCase().includes(type.toLowerCase()));
    }

    // Настройка автозаполнения для кода ИКАО
    function setupIcaoAutocomplete() {
        // Создаем контейнер для подсказок
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.zIndex = '1000';
        suggestionsContainer.style.backgroundColor = 'white';
        suggestionsContainer.style.border = '1px solid #ccc';
        suggestionsContainer.style.maxHeight = '200px';
        suggestionsContainer.style.overflowY = 'auto';
        suggestionsContainer.style.display = 'none';
        
        // Добавляем контейнер после поля ввода
        elements.icaoCode.parentNode.appendChild(suggestionsContainer);
        
        elements.icaoCode.addEventListener('input', function() {
            const searchTerm = this.value.trim().toUpperCase();
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            
            if (searchTerm.length < 1) return;
            
            // Поиск только по коду ИКАО
            const results = findAerodromsByPartialIcao(searchTerm);
            
            if (results.length > 0) {
                results.forEach(aerodrom => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'suggestion-item';
                    suggestion.style.padding = '8px';
                    suggestion.style.cursor = 'pointer';
                    suggestion.style.borderBottom = '1px solid #eee';
                    suggestion.innerHTML = `
                        <strong>${aerodrom.KOD_ICAO}</strong> - ${aerodrom.NAME_AERO}
                        <br><small>${aerodrom.city}, ВПП: ${aerodrom.runways.join(', ')}</small>
                    `;
                    suggestion.addEventListener('click', () => {
                        elements.icaoCode.value = aerodrom.KOD_ICAO;
                        fillAerodromFields(aerodrom);
                        suggestionsContainer.style.display = 'none';
                    });
                    suggestion.addEventListener('mouseover', () => {
                        suggestion.style.backgroundColor = '#f0f0f0';
                    });
                    suggestion.addEventListener('mouseout', () => {
                        suggestion.style.backgroundColor = 'white';
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
                suggestionsContainer.style.display = 'block';
            }
        });

        // Скрываем подсказки при клике вне поля
        document.addEventListener('click', function(e) {
            if (e.target !== elements.icaoCode && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Обработка клавиш
        elements.icaoCode.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    // Поиск аэродрома по коду ИКАО
    function searchByIcao() {
        const icaoCode = elements.icaoCode.value.trim().toUpperCase();
        if (!icaoCode) {
            alert('Введите код ИКАО');
            return;
        }
        
        const aerodrom = findAerodromByIcao(icaoCode);
        if (aerodrom) {
            fillAerodromFields(aerodrom);
        } else {
            alert(`Аэродром с кодом ${icaoCode} не найден`);
        }
    }

    // Заполнение полей аэродрома
    function fillAerodromFields(aerodrom) {
        elements.airportInput.value = aerodrom.NAME_AERO;
        document.getElementById('airportElevation').value = aerodrom.LEV_KTA;
        document.getElementById('latitude').value = formatCoordinate(aerodrom.LAT_DEG, true);
        document.getElementById('longitude').value = formatCoordinate(aerodrom.LONG_DEG, false);
        
        // Заполнение выпадающего списка ВПП
        elements.runwaySelect.innerHTML = '';
        aerodrom.runways.forEach(rwy => {
            const option = document.createElement('option');
            option.value = rwy;
            option.textContent = rwy;
            elements.runwaySelect.appendChild(option);
        });
    }

    // Форматирование координат
    function formatCoordinate(degrees, isLatitude) {
        const absDegrees = Math.abs(degrees);
        const dir = isLatitude ? 
            (degrees >= 0 ? 'с' : 'ю') : 
            (degrees >= 0 ? 'в' : 'з');
        
        const deg = Math.floor(absDegrees);
        const min = Math.floor((absDegrees - deg) * 60);
        const sec = Math.round(((absDegrees - deg) * 60 - min) * 60);
        
        return `${dir} ${deg}.${min}.${sec}`;
    }

    // Инициализация сетки самолетов
    function initAircraftGrid() {
        elements.grid.innerHTML = '';
        AIRCRAFTS.forEach(aircraft => {
            const card = document.createElement('div');
            card.className = 'aircraft-card';
            card.innerHTML = `
                <div class="aircraft-image">
                    <img src="${aircraft.image}" alt="${aircraft.name}" 
                        onerror="this.onerror=null;this.src='./img/no-image.jpg'">
                </div>
                <div class="aircraft-info">
                    <h3>${aircraft.name}</h3>
                    <p><strong>Бортовой номер:</strong> ${aircraft.regNumber}</p>
                    <p><strong>Макс. взлётный вес:</strong> ${aircraft.maxWeight/1000} тонн</p>
                    <p><strong>Дальность:</strong> ${aircraft.range}</p>
                    <button class="select-btn">Выбрать для расчетов</button>
                </div>
            `;
            card.querySelector('.select-btn').addEventListener('click', () => {
                fillFormWithAircraftData(aircraft);
                openCalcModal();
            });
            elements.grid.appendChild(card);
        });
    }

    // Заполнение формы данными ВС
    function fillFormWithAircraftData(aircraft) {
        elements.aircraftType.value = aircraft.name;
        elements.registrationNumber.value = aircraft.regNumber;
        elements.weight.placeholder = `Максимум: ${aircraft.maxWeight/1000} тонн`;
        
        // Заполняем выпадающий список положений закрылков
        elements.flapsSelect.innerHTML = '';
        aircraft.flapsOptions.forEach(angle => {
            const option = document.createElement('option');
            option.value = angle;
            option.textContent = `${angle}°`;
            elements.flapsSelect.appendChild(option);
        });

        // Устанавливаем текущую дату и время
        const now = new Date();
        document.getElementById('flightDate').valueAsDate = now;
        document.getElementById('flightTime').value = 
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // Настройка обработчиков модальных окон
    function setupModalHandlers() {
        document.getElementById('closeCalcModal').addEventListener('click', closeCalcModal);
        document.getElementById('closeResultModal').addEventListener('click', closeResultModal);
        document.getElementById('cancelCalc').addEventListener('click', closeCalcModal);
        document.getElementById('icaoSearchBtn').addEventListener('click', searchByIcao);
        
        window.addEventListener('click', function(e) {
            if (e.target === elements.calcModal) closeCalcModal();
            if (e.target === elements.resultModal) closeResultModal();
        });
    }

    // Дополнительные обработчики событий
    function setupEventListeners() {
        // Обработчик изменения типа ВС
        elements.aircraftType.addEventListener('change', function() {
            const aircraft = findAircraftByType(this.value);
            if (aircraft) {
                fillFormWithAircraftData(aircraft);
            }
        });

        // Автоматический поиск при вводе кода ИКАО (по нажатию Enter)
        elements.icaoCode.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchByIcao();
            }
        });
    }

    // Управление модальными окнами
    function openCalcModal() {
        elements.calcModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCalcModal() {
        elements.calcModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function openResultModal() {
        elements.resultModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeResultModal() {
        elements.resultModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Обработка формы
    function setupFormHandler() {
        elements.calcForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = collectFormData();
            const results = calculateResults(formData);
            showResults(formData, results);
            closeCalcModal();
        });
    }

    // Сбор данных формы
    function collectFormData() {
        return {
            aircraftType: elements.aircraftType.value,
            registrationNumber: elements.registrationNumber.value,
            flightNumber: document.getElementById('flightNumber').value,
            flightDate: document.getElementById('flightDate').value,
            flightTime: document.getElementById('flightTime').value,
            airportName: elements.airportInput.value,
            icaoCode: elements.icaoCode.value,
            airportElevation: document.getElementById('airportElevation').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value,
            temperature: document.getElementById('temperature').value,
            qnh: document.getElementById('qnh').value,
            windDirection: document.getElementById('windDirection').value,
            windSpeed: document.getElementById('windSpeed').value,
            runway: elements.runwaySelect.value,
            runwayCondition: document.getElementById('runwayCondition').value,
            weight: elements.weight.value,
            flaps: elements.flapsSelect.value,
            antiice: elements.antiiceSelect.value
        };
    }

    // Расчет результатов
    function calculateResults(formData) {
        const aircraft = findAircraftByType(formData.aircraftType);
        const aerodrom = findAerodromByIcao(formData.icaoCode);
        
        let requiredRunway = aircraft.baseRunway;
        
        // Корректировки на условия
        const corrections = {
            wet: 1.15,
            snow: 1.3,
            ice: 1.5,
            temperature: 0.02 // 2% на каждый градус выше +15°C
        };
        
        // Корректировка на состояние ВПП
        requiredRunway *= corrections[formData.runwayCondition] || 1;
        
        // Корректировка на температуру
        const temp = parseInt(formData.temperature) || 0;
        if (temp > 15) {
            requiredRunway *= (1 + (temp - 15) * corrections.temperature);
        }
        
        // Корректировка на ветер
        const windSpeed = parseInt(formData.windSpeed) || 0;
        if (windSpeed < 5) {
            requiredRunway *= 1.1; // +10% при слабом ветре
        }
        
        // Проверка веса
        const weightStatus = checkWeight(parseInt(formData.weight), aircraft.maxWeight);
        
        // Рекомендации по конфигурации
        const recommendedConfig = getRecommendedConfig(formData, aircraft);
        
        // Примечания
        const notes = generateNotes(formData);
        
        return {
            requiredRunway: `${Math.round(requiredRunway)} м`,
            weightStatus: weightStatus,
            recommendedConfig: recommendedConfig,
            notes: notes
        };
    }

    // Проверка веса
    function checkWeight(currentWeight, maxWeight) {
        currentWeight = parseInt(currentWeight);
        if (currentWeight > maxWeight) return 'Превышение максимальной массы';
        if (currentWeight > maxWeight * 0.95) return 'Предельная масса';
        return 'В пределах нормы';
    }

    // Рекомендации по конфигурации
    function getRecommendedConfig(formData, aircraft) {
        let config = `Закрылки ${formData.flaps}°`;
        
        if (formData.runwayCondition === 'wet' || formData.runwayCondition === 'snow') {
            config += ', реверс';
        }
        
        if (parseInt(formData.temperature) > 30) {
            config += ', уменьшенная тяга';
        }
        
        return config;
    }

    // Генерация примечаний
    function generateNotes(formData) {
        const notes = [];
        
        if (formData.runwayCondition === 'ice') {
            notes.push('Требуется дополнительная проверка ВПП');
        }
        
        if (parseInt(formData.windSpeed) > 15) {
            notes.push('Сильный боковой ветер - будьте осторожны');
        }
        
        return notes.length ? notes.join('; ') : 'Особых замечаний нет';
    }

    // Отображение результатов
    function showResults(formData, results) {
        elements.resultData.innerHTML = `
            <div class="result-section">
                <h3>Результаты расчета</h3>
                <div class="input-data">
                    <h4>Входные данные:</h4>
                    <table>
                        <tr><th>Тип ВС:</th><td>${formData.aircraftType}</td></tr>
                        <tr><th>Бортовой номер:</th><td>${formData.registrationNumber}</td></tr>
                        <tr><th>Аэродром:</th><td>${formData.airportName} (${formData.icaoCode})</td></tr>
                        <tr><th>ВПП:</th><td>${formData.runway} (${formData.runwayCondition})</td></tr>
                        <tr><th>Масса:</th><td>${formData.weight} кг</td></tr>
                    </table>
                </div>
                <div class="results">
                    <h4>Результаты:</h4>
                    <table>
                        <tr><th>Требуемая длина ВПП:</th><td>${results.requiredRunway}</td></tr>
                        <tr><th>Статус веса:</th><td>${results.weightStatus}</td></tr>
                        <tr><th>Рекомендации:</th><td>${results.recommendedConfig}</td></tr>
                        <tr><th>Примечания:</th><td>${results.notes}</td></tr>
                    </table>
                </div>
            </div>
            <div class="action-buttons">
                <button id="downloadPdf" class="btn-primary">Скачать PDF</button>
                <button id="closeResultModal" class="btn-secondary">Закрыть</button>
            </div>
        `;
        
        document.getElementById('downloadPdf').addEventListener('click', () => {
            try {
                const pdfGenerator = new PdfGenerator(CONFIG.pdfSettings);
                const pdfDoc = pdfGenerator.generate(formData, results);
                pdfDoc.save(`Расчет_ВПП_${formData.aircraftType}_${formData.flightDate}.pdf`);
            } catch (error) {
                console.error('Ошибка генерации PDF:', error);
                alert('Не удалось сгенерировать PDF. Проверьте консоль для подробностей.');
            }
        });
        
        document.getElementById('closeResultModal').addEventListener('click', closeResultModal);
        
        openResultModal();
    }

    // Запуск приложения
    init();
});
