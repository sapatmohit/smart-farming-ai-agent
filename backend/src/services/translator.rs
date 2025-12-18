use std::collections::HashMap;
use tracing::debug;

/// Simple language detection and translation service
/// For production, integrate with IBM Watson Language Translator

/// Common Hindi farming terms for detection
const HINDI_MARKERS: &[&str] = &[
    "क्या", "है", "में", "को", "की", "का", "और", "से", "पर", "कैसे", 
    "खेती", "फसल", "मंडी", "किसान", "बारिश", "मिट्टी", "कीट", "रोग",
    "आज", "कल", "अभी", "कितना", "कौन", "कहाँ", "भाव", "पानी"
];

/// Common Marathi farming terms for detection
const MARATHI_MARKERS: &[&str] = &[
    "काय", "आहे", "मध्ये", "ला", "ची", "चा", "आणि", "वर", "कसा",
    "शेती", "पीक", "बाजार", "शेतकरी", "पाऊस", "माती", "कीड", "रोग",
    "आज", "उद्या", "आता", "किती", "कोण", "कुठे", "भाव"
];

/// Detect the language of input text
pub fn detect_language(text: &str) -> String {
    // Check for Devanagari script
    let has_devanagari = text.chars().any(|c| ('\u{0900}'..='\u{097F}').contains(&c));
    
    if !has_devanagari {
        return "en".to_string();
    }

    // Count Hindi vs Marathi markers
    let hindi_count = HINDI_MARKERS.iter()
        .filter(|&marker| text.contains(marker))
        .count();
    
    let marathi_count = MARATHI_MARKERS.iter()
        .filter(|&marker| text.contains(marker))
        .count();

    debug!("Language detection - Hindi markers: {}, Marathi markers: {}", hindi_count, marathi_count);

    // If Marathi markers are more common, it's likely Marathi
    if marathi_count > hindi_count {
        "mr".to_string()
    } else if has_devanagari {
        "hi".to_string()  // Default Devanagari to Hindi
    } else {
        "en".to_string()
    }
}

/// Translation dictionary for common farming terms (Hindi <-> English)
lazy_static::lazy_static! {
    static ref HINDI_TO_ENGLISH: HashMap<&'static str, &'static str> = {
        let mut m = HashMap::new();
        m.insert("गेहूं", "wheat");
        m.insert("धान", "rice/paddy");
        m.insert("टमाटर", "tomato");
        m.insert("प्याज", "onion");
        m.insert("आलू", "potato");
        m.insert("मंडी", "market/mandi");
        m.insert("भाव", "price");
        m.insert("खेती", "farming");
        m.insert("फसल", "crop");
        m.insert("किसान", "farmer");
        m.insert("बारिश", "rain");
        m.insert("पानी", "water");
        m.insert("सिंचाई", "irrigation");
        m.insert("कीट", "pest");
        m.insert("रोग", "disease");
        m.insert("मिट्टी", "soil");
        m.insert("खाद", "fertilizer");
        m.insert("बीज", "seed");
        m.insert("हंगाम", "season");
        m
    };

    static ref ENGLISH_TO_HINDI: HashMap<&'static str, &'static str> = {
        let mut m = HashMap::new();
        m.insert("wheat", "गेहूं");
        m.insert("rice", "धान");
        m.insert("paddy", "धान");
        m.insert("tomato", "टमाटर");
        m.insert("onion", "प्याज");
        m.insert("potato", "आलू");
        m.insert("market", "मंडी");
        m.insert("mandi", "मंडी");
        m.insert("price", "भाव/दाम");
        m.insert("farming", "खेती");
        m.insert("crop", "फसल");
        m.insert("farmer", "किसान");
        m.insert("rain", "बारिश");
        m.insert("water", "पानी");
        m.insert("irrigation", "सिंचाई");
        m.insert("pest", "कीट");
        m.insert("disease", "रोग");
        m.insert("soil", "मिट्टी");
        m.insert("fertilizer", "खाद");
        m.insert("seed", "बीज");
        m.insert("season", "मौसम");
        m
    };
}

/// Translate text from Hindi/Marathi to English
/// For MVP, we keep the original text but add context for the LLM
pub fn translate_to_english(text: &str, _from_lang: &str) -> String {
    // For MVP: Keep original text but provide context hints
    // In production, use IBM Watson Language Translator API
    
    let mut translated = text.to_string();
    
    // Add English translations for known farming terms
    for (hindi, english) in HINDI_TO_ENGLISH.iter() {
        if text.contains(hindi) {
            translated = format!("{} [{}={}]", translated, hindi, english);
        }
    }

    // Add a note for the LLM
    format!("Original query (in Indian language): {} \n\nPlease understand the context and respond appropriately.", translated)
}

/// Translate response from English to user's language
/// For MVP, we keep English with key terms translated
pub fn translate_from_english(text: &str, to_lang: &str) -> String {
    if to_lang == "en" {
        return text.to_string();
    }

    // For MVP: Add Hindi/Marathi translations of key terms in parentheses
    let mut result = text.to_string();
    
    if to_lang == "hi" || to_lang == "mr" {
        for (english, hindi) in ENGLISH_TO_HINDI.iter() {
            // Case-insensitive replacement with Hindi term in parentheses
            let pattern = format!(r"(?i)\b{}\b", english);
            if let Ok(re) = regex::Regex::new(&pattern) {
                result = re.replace_all(&result, |caps: &regex::Captures| {
                    format!("{} ({})", &caps[0], hindi)
                }).to_string();
            }
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_hindi() {
        assert_eq!(detect_language("आज टमाटर का भाव क्या है?"), "hi");
    }

    #[test]
    fn test_detect_english() {
        assert_eq!(detect_language("What is the price of tomato today?"), "en");
    }
}
