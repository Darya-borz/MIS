/**
 * Класс для генерации PDF документов с расчетами ВПП
 * с полной поддержкой кириллицы
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
    
    // Устанавливаем стандартный шрифт (будем использовать встроенные латинские символы)
    this.doc.setFont('helvetica');
  }

  initThemes() {
    this.themes = {
      default: {
        primaryColor: [0, 51, 102],
        secondaryColor: [100, 100, 100],
        textColor: [0, 0, 0],
        headerFontSize: 16,
        sectionFontSize: 12,
        textFontSize: 10,
        footerFontSize: 8
      }
    };

    this.theme = this.themes[this.settings.theme] || this.themes.default;
  }

  initTranslations() {
    this.translations = {
      ru: {
        header: 'OTCHET O RASCHETE VPP',
        aircraftInfo: 'DANNYE VOZDUSHNOGO SUDNA',
        flightInfo: 'PARAMETRY POLETA',
        weatherInfo: 'METEOUSLOVIYA',
        results: 'REZULTATY RASCHETA',
        generated: 'Sformirovano',
        aircraftType: 'Tip VS',
        regNumber: 'Bortovoy nomer',
        weight: 'Vzletnaya massa',
        config: 'Konfiguraciya',
        airport: 'Aerodrom',
        dateTime: 'Data/vremya',
        runway: 'VPP',
        condition: 'Sostoyanie VPP',
        temperature: 'Temperatura',
        pressure: 'Davlenie (QNH)',
        wind: 'Veter',
        requiredRunway: 'Trebuemaya dlina VPP',
        weightStatus: 'Status massy',
        recommendedConfig: 'Rekomenduemaya konfiguraciya',
        notes: 'Primechaniya',
        signature: 'Podpis otvetstvennogo lica',
        flightNumber: 'Nomer reysa',
        elevation: 'Vysota aerodroma',
        coordinates: 'Koordinaty',
        flaps: 'Polozhenie zakrylkov',
        antiice: 'Protivoled. sistema'
      }
    };

    this.lang = this.translations[this.settings.language] || this.translations.ru;
  }

  /**
   * Конвертация кириллицы в латиницу (транслитерация)
   */
  transliterate(text) {
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
      'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
      'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
      'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
      'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };

    return text.split('').map(char => translitMap[char] || char).join('');
  }

  /**
   * Основной метод генерации PDF
   */
  generate(formData, results) {
    try {
      this.addHeader();
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

  addAircraftInfo(data) {
    this.addSectionTitle(this.lang.aircraftInfo);
    
    const info = [
      `${this.lang.aircraftType}: ${this.transliterate(data.aircraftType)}`,
      `${this.lang.regNumber}: ${data.registrationNumber}`,
      `${this.lang.flightNumber}: ${data.flightNumber || 'Ne ukazan'}`,
      `${this.lang.weight}: ${this.formatNumber(data.weight)} kg`,
      `${this.lang.flaps}: zakrylki ${data.flaps}°`,
      `${this.lang.antiice}: ${data.antiice === 'on' ? 'vkl' : 'vykl'}`
    ];
    
    this.addList(info);
  }

  addFlightInfo(data) {
    this.addSectionTitle(this.lang.flightInfo);
    
    const info = [
      `${this.lang.airport}: ${this.transliterate(data.airportName)} (${data.icaoCode})`,
      `${this.lang.elevation}: ${data.airportElevation} m`,
      `${this.lang.coordinates}: ${data.latitude}, ${data.longitude}`,
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
      `${this.lang.pressure}: ${data.qnh} mm rt.st.`,
      `${this.lang.wind}: ${data.windDirection}° ${data.windSpeed} m/s`
    ];
    
    this.addList(info);
  }

  addResults(results) {
    this.addSectionTitle(this.lang.results);
    
    const resultItems = [
      { label: this.lang.requiredRunway, value: results.requiredRunway },
      { label: this.lang.weightStatus, value: this.transliterate(results.weightStatus) },
      { label: this.lang.recommendedConfig, value: this.transliterate(results.recommendedConfig) },
      { label: this.lang.notes, value: this.transliterate(results.notes) }
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
      `${this.lang.generated}: ${new Date().toLocaleString('ru-RU')}`,
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
        fontStyle: 'bold'
      },
      section: {
        fontSize: this.theme.sectionFontSize,
        textColor: this.theme.primaryColor,
        fontStyle: 'bold'
      },
      text: {
        fontSize: this.theme.textFontSize,
        textColor: this.theme.textColor,
        fontStyle: 'normal'
      },
      textBold: {
        fontSize: this.theme.textFontSize,
        textColor: this.theme.textColor,
        fontStyle: 'bold'
      },
      footer: {
        fontSize: this.theme.footerFontSize,
        textColor: this.theme.secondaryColor,
        fontStyle: 'normal'
      }
    };

    const style = styles[styleType] || styles.text;
    
    this.doc.setFontSize(style.fontSize);
    this.doc.setTextColor(...style.textColor);
    this.doc.setFont('helvetica', style.fontStyle);
  }

  formatDateTime(dateStr, timeStr) {
    try {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('ru-RU');
      return `${formattedDate} ${timeStr}`;
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  }

  formatNumber(number) {
    return new Intl.NumberFormat('ru-RU').format(number);
  }

  getRunwayCondition(condition) {
    const conditions = {
      dry: 'sukhaya',
      wet: 'mokraya',
      snow: 'sneg',
      ice: 'led'
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