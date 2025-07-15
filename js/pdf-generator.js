/**
 * Класс для генерации PDF документов с расчетами ВПП
 */
class PdfGenerator {
  constructor(options = {}) {
    if (typeof jsPDF === 'undefined') {
      throw new Error('Библиотека jsPDF не загружена');
    }

    const defaults = {
      language: 'ru',
      theme: 'default',
      logo: null,
      unit: 'mm'
    };

    this.settings = { ...defaults, ...options };
    this.initDocument();
    this.initThemes();
    this.initTranslations();
    this.initFonts();
  }

  initFonts() {
    // Подключаем стандартный шрифт с кириллицей
    this.doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', 'Roboto', 'normal');
    this.doc.setFont('Roboto', 'normal');
}

  initDocument() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: this.settings.unit,
      format: 'a4'
    });

    this.margin = 15;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.yPosition = 20;
    this.lineHeight = 8;
  }

  initThemes() {
    this.themes = {
      default: {
        primaryColor: [0, 51, 102],
        secondaryColor: [100, 100, 100],
        textColor: [0, 0, 0],
        headerFontSize: 18,
        sectionFontSize: 14,
        textFontSize: 12,
        footerFontSize: 10
      },
      dark: {
        primaryColor: [30, 30, 30],
        secondaryColor: [150, 150, 150],
        textColor: [220, 220, 220],
        headerFontSize: 18,
        sectionFontSize: 14,
        textFontSize: 12,
        footerFontSize: 10
      }
    };

    this.theme = this.themes[this.settings.theme] || this.themes.default;
  }

  initTranslations() {
    this.translations = {
      ru: {
        header: 'ОТЧЕТ О РАСЧЕТЕ ВПП',
        aircraftInfo: 'ДАННЫЕ ВОЗДУШНОГО СУДНА',
        flightInfo: 'ПАРАМЕТРЫ ПОЛЕТА',
        weatherInfo: 'МЕТЕОУСЛОВИЯ',
        results: 'РЕЗУЛЬТАТЫ РАСЧЕТА',
        generated: 'Сформировано',
        aircraftType: 'Тип ВС',
        regNumber: 'Бортовой номер',
        weight: 'Взлетная масса',
        config: 'Конфигурация',
        airport: 'Аэродром',
        dateTime: 'Дата/время',
        runway: 'ВПП',
        condition: 'Состояние ВПП',
        temperature: 'Температура',
        pressure: 'Давление (QNH)',
        wind: 'Ветер',
        requiredRunway: 'Требуемая длина ВПП',
        weightStatus: 'Превышение массы',
        recommendedConfig: 'Рекомендуемая конфигурация',
        notes: 'Примечания',
        signature: 'Подпись ответственного лица'
      },
      en: {
        // ... аналогично для английского
      }
    };

    this.lang = this.translations[this.settings.language] || this.translations.ru;
   
  }

  /**
   * Основной метод генерации PDF
   */
  generate(formData, results) {
    try {
      this.addHeader();
      this.addLogo();
      this.addAircraftInfo(formData);
      this.addFlightInfo(formData);
      this.addWeatherInfo(formData);
      this.addResults(results);
      this.addSignature();
      this.addFooter();
      
      return this.doc;
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      throw error;
    }
  }

  addHeader() {
    this.setStyle('header');
    this.doc.text(this.lang.header, this.pageWidth / 2, this.yPosition, { 
      align: 'center' 
    });
    this.yPosition += this.lineHeight * 2;
  }

  addLogo() {
    if (!this.settings.logo) return;
    
    try {
      const imgWidth = 40;
      const imgHeight = 15;
      this.doc.addImage(
        this.settings.logo, 
        'PNG', 
        this.pageWidth - this.margin - imgWidth, 
        this.margin, 
        imgWidth, 
        imgHeight
      );
    } catch (error) {
      console.warn('Не удалось добавить логотип:', error);
    }
  }

  addAircraftInfo(data) {
    this.addSectionTitle(this.lang.aircraftInfo);
    
    const info = [
      `${this.lang.aircraftType}: ${data.aircraftType}`,
      `${this.lang.regNumber}: ${data.registrationNumber}`,
      `${this.lang.weight}: ${data.weight} кг`,
      `${this.lang.config}: закрылки ${data.flaps}°, противолед ${data.antiice === 'on' ? 'вкл' : 'выкл'}`
    ];
    
    this.addList(info);
  }

  addFlightInfo(data) {
    this.addSectionTitle(this.lang.flightInfo);
    
    const info = [
      `${this.lang.airport}: ${data.airportName} (${data.icaoCode})`,
      `${this.lang.dateTime}: ${this.formatDateTime(data.flightDate, data.flightTime)}`,
      `${this.lang.runway}: ${data.runway}`,
      `${this.lang.condition}: ${this.getRunwayCondition(data.runwayCondition)}`
    ];
    
    this.addList(info);
  }

  addWeatherInfo(data) {
    this.addSectionTitle(this.lang.weatherInfo);
    
    const info = [
      `${this.lang.temperature}: ${data.temperature}°C`,
      `${this.lang.pressure}: ${data.qnh} мм рт.ст.`,
      `${this.lang.wind}: ${data.windDirection}° ${data.windSpeed} м/с`
    ];
    
    this.addList(info);
  }

  addResults(results) {
    this.addSectionTitle(this.lang.results);
    
    const resultItems = [
      { label: this.lang.requiredRunway, value: results.requiredRunway },
      { label: this.lang.weightStatus, value: results.weightStatus },
      { label: this.lang.recommendedConfig, value: results.recommendedConfig },
      { label: this.lang.notes, value: results.notes }
    ];
    
    this.addLabelValueList(resultItems);
  }

  addSignature() {
    if (this.yPosition > this.pageHeight - 40) {
      this.addNewPage();
    }
    
    this.yPosition += 20;
    this.doc.line(
      this.margin + 50, 
      this.yPosition, 
      this.margin + 100, 
      this.yPosition
    );
    this.yPosition += 5;
    
    this.setStyle('text');
    this.doc.text(
      this.lang.signature, 
      this.margin + 75, 
      this.yPosition, 
      { align: 'center' }
    );
    this.yPosition += 10;
  }

  addFooter() {
    this.setStyle('footer');
    this.doc.text(
      `${this.lang.generated}: ${new Date().toLocaleString()}`,
      this.margin,
      this.pageHeight - 10
    );
  }

  // Вспомогательные методы
  addSectionTitle(title) {
    this.checkPageBreak(20);
    this.setStyle('section');
    this.doc.text(title, this.margin, this.yPosition);
    this.yPosition += this.lineHeight;
  }

  addList(items) {
    this.checkPageBreak(items.length * this.lineHeight);
    
    this.setStyle('text');
    items.forEach(item => {
      this.doc.text(item, this.margin, this.yPosition);
      this.yPosition += this.lineHeight;
    });
    
    this.yPosition += this.lineHeight / 2;
  }

  addLabelValueList(items) {
    const labelWidth = 60;
    
    items.forEach(item => {
      this.checkPageBreak(this.lineHeight);
      
      this.setStyle('textBold');
      this.doc.text(item.label, this.margin, this.yPosition);
      this.setStyle('text');
      this.doc.text(item.value, this.margin + labelWidth, this.yPosition);
      
      this.yPosition += this.lineHeight;
    });
    
    this.yPosition += this.lineHeight / 2;
  }

  addNewPage() {
    this.doc.addPage();
    this.yPosition = 20;
    this.addHeader();
    this.addLogo();
  }

  checkPageBreak(spaceNeeded) {
    if (this.yPosition + spaceNeeded > this.pageHeight - 20) {
      this.addNewPage();
    }
  }

  setStyle(styleType) {
    const styles = {
        header: {
            fontSize: this.theme.headerFontSize,
            textColor: this.theme.primaryColor,
            fontStyle: 'bold',
            fontFamily: 'Roboto' // Используем шрифт с поддержкой кириллицы
        },
        section: {
            fontSize: this.theme.sectionFontSize,
            textColor: this.theme.primaryColor,
            fontStyle: 'bold',
            fontFamily: 'Roboto'
        },
        text: {
            fontSize: this.theme.textFontSize,
            textColor: this.theme.textColor,
            fontStyle: 'normal',
            fontFamily: 'Roboto'
        },
        textBold: {
            fontSize: this.theme.textFontSize,
            textColor: this.theme.textColor,
            fontStyle: 'bold',
            fontFamily: 'Roboto'
        },
        footer: {
            fontSize: this.theme.footerFontSize,
            textColor: this.theme.secondaryColor,
            fontStyle: 'normal',
            fontFamily: 'Roboto'
        }
    };

    const style = styles[styleType] || styles.text;
    
    try {
        this.doc.setFontSize(style.fontSize);
        this.doc.setTextColor(...style.textColor);
        
        // Пытаемся использовать Roboto, если не получится - fallback на helvetica
        if (this.doc.getFontList().includes('Roboto')) {
            this.doc.setFont('Roboto', style.fontStyle);
        } else {
            console.warn('Шрифт Roboto не найден, используем helvetica');
            this.doc.setFont('helvetica', style.fontStyle);
        }
    } catch (error) {
        console.error('Ошибка установки стиля:', error);
        // Фолбэк на стандартные настройки
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'normal');
    }
}

  formatDateTime(dateStr, timeStr) {
    try {
      const date = new Date(dateStr);
      return `${date.toLocaleDateString()} ${timeStr}`;
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  }

  getRunwayCondition(condition) {
    const conditions = {
      dry: 'сухая',
      wet: 'мокрая',
      snow: 'снег',
      ice: 'лед'
    };
    return conditions[condition] || condition;
  }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PdfGenerator;
} else {
  window.PdfGenerator = PdfGenerator;
}