document.addEventListener('DOMContentLoaded', function() {
    const aircrafts = [
        {
            name: "Sukhoi Superjet 100",
            regNumber: "RA-89011",
            maxWeight: "45.9 тонн",
            range: "3048 км",
            passengers: "98",
            description: "Основной российский ближнемагистральный лайнер"
        },
        {
            name: "Irkut MC-21-300",
            regNumber: "RA-73651",
            maxWeight: "79.2 тонны",
            range: "6000 км",
            passengers: "211",
            description: "Новейший российский авиалайнер"
        },
        {
            name: "Ил-96-300",
            regNumber: "RA-96018",
            maxWeight: "250 тонн",
            range: "11500 км",
            passengers: "300",
            description: "Флагманский дальнемагистральный самолёт"
        },
        {
            name: "Ту-214",
            regNumber: "RA-64501",
            maxWeight: "110.8 тонн",
            range: "6500 км",
            passengers: "210",
            description: "Среднемагистральный пассажирский самолёт"
        },
        {
            name: "Як-42",
            regNumber: "RA-42430",
            maxWeight: "57.5 тонн",
            range: "2900 км",
            passengers: "120",
            description: "Надёжный региональный лайнер"
        },
        {
            name: "Ан-148",
            regNumber: "RA-61708",
            maxWeight: "43.7 тонн",
            range: "2200 км",
            passengers: "85",
            description: "Компактный региональный самолёт"
        }
    ];

    function createAircraftCard(aircraft) {
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        
        card.innerHTML = `
            <div class="aircraft-image">
                <div class="image-placeholder">${aircraft.name}</div>
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
    const grid = document.getElementById('aircraftGrid');
    if (grid) {
        aircrafts.forEach(aircraft => {
            grid.appendChild(createAircraftCard(aircraft));
        });
    } else {
        console.error('Элемент #aircraftGrid не найден!');
        
        // Создаём grid динамически, если он отсутствует
        const newGrid = document.createElement('div');
        newGrid.id = 'aircraftGrid';
        newGrid.className = 'aircraft-grid';
        document.querySelector('.catalog').appendChild(newGrid);
        aircrafts.forEach(aircraft => {
            newGrid.appendChild(createAircraftCard(aircraft));
        });
    }
    const selectButtons = document.querySelectorAll('.select-btn');
    const calcModal = document.getElementById('calcModal');
    const closeCalcModal = document.getElementById('closeCalcModal');
    const aircraftNameInput = document.getElementById('aircraftName');
    const calcForm = document.getElementById('calcForm');
    
    // Обработчик для кнопок "Выбрать для расчётов"
selectButtons.forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.aircraft-card');
        const aircraftTitle = card.querySelector('.aircraft-title').textContent;
        const regNumber = card.querySelector('.spec-value').textContent;
        
        // Заполняем данные самолёта в форме
        document.getElementById('aircraftType').value = aircraftTitle;
        document.getElementById('registrationNumber').value = regNumber;
        
        // Устанавливаем текущие дату и время
        const now = new Date();
        document.getElementById('flightDate').valueAsDate = now;
        document.getElementById('flightTime').value = 
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Показываем модальное окно
        calcModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});
// Обработчик для кнопки закрытия
    closeCalcModal.addEventListener('click', function() {
        calcModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Закрытие по клику вне формы
    window.addEventListener('click', function(e) {
        if (e.target === calcModal) {
            calcModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
// Обработчик кнопки "Отмена"
document.getElementById('cancelCalc').addEventListener('click', function() {
    calcModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Обработка формы расчётов
calcForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Собираем данные формы
    const formData = {
        aircraftType: document.getElementById('aircraftType').value,
        flightNumber: document.getElementById('flightNumber').value,
        registrationNumber: document.getElementById('registrationNumber').value,
        flightDate: document.getElementById('flightDate').value,
        flightTime: document.getElementById('flightTime').value,
        airport: document.getElementById('airport').value,
        temperature: document.getElementById('temperature').value,
        qnh: document.getElementById('qnh').value,
        windDirection: document.getElementById('windDirection').value,
        windSpeed: document.getElementById('windSpeed').value,
        runway: document.getElementById('runway').value,
        runwayCondition: document.getElementById('runwayCondition').value,
        weight: document.getElementById('weight').value,
        flaps: document.getElementById('flaps').value,
        antiice: document.getElementById('antiice').value
    };
    
    console.log('Данные для расчёта:', formData);
    
    // Здесь будет логика расчётов и отображения результатов
    alert('Расчёт выполнен! Данные можно увидеть в консоли (F12)');
    
    // Закрываем модальное окно
    calcModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    this.reset();
});
});