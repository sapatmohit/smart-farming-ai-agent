/// In-memory knowledge base for farming advice.
/// Contains structured data about crops, weather, pest control, and market prices.

#[derive(Clone, Debug)]
pub struct Document {
    pub title: String,
    pub content: String,
    pub category: String, // "crops", "weather", "pest_control", "market_prices", "soil"
    pub source: String,
}

/// Get all documents from the knowledge base
pub fn get_all_documents() -> Vec<Document> {
    vec![
        // Crop Guidelines
        Document {
            title: "Wheat Cultivation - Rabi Season".to_string(),
            content: "Wheat is a major rabi crop in India. Best sowing time is October to November. \
                     Ideal soil temperature is 20-25°C. Requires 4-5 irrigations. Popular varieties: \
                     HD-2967, PBW-343, DBW-17. Yield potential: 45-50 quintals per hectare with proper care.".to_string(),
            category: "crops".to_string(),
            source: "ICAR Wheat Guidelines".to_string(),
        },
        Document {
            title: "Tomato Farming".to_string(),
            content: "Tomatoes can be grown year-round in most parts of India. Optimal temperature: 20-27°C. \
                     Requires well-drained loamy soil with pH 6.0-7.0. Spacing: 60x45cm. Popular varieties: \
                     Pusa Ruby, Arka Vikas. Common diseases: Early blight, late blight. Use drip irrigation.".to_string(),
            category: "crops".to_string(),
            source: "TNAU Agritech Portal".to_string(),
        },
        Document {
            title: "Onion Cultivation".to_string(),
            content: "Onion is grown in Kharif (June-July), Late Kharif (Sept-Oct), and Rabi (Dec-Jan). \
                     Requires sandy loam to clay loam soil. Popular varieties: Agrifound Dark Red, Pusa Red. \
                     Harvest when 50% tops fall. Store in well-ventilated rooms. Avoid waterlogging.".to_string(),
            category: "crops".to_string(),
            source: "NHRDF Guidelines".to_string(),
        },
        Document {
            title: "Rice Paddy Cultivation".to_string(),
            content: "Rice is the staple Kharif crop. Sowing: June-July with monsoon onset. Transplanting age: \
                     21-25 days. Water management: 5cm standing water during vegetative stage. Popular varieties: \
                     Swarna, IR-64, Pusa Basmati. Harvest at 80% grain maturity.".to_string(),
            category: "crops".to_string(),
            source: "DRR Hyderabad".to_string(),
        },

        // Weather Advisory
        Document {
            title: "Monsoon Season Advisory".to_string(),
            content: "During monsoon (June-September), ensure proper field drainage. Avoid fertilizer application \
                     during heavy rains. Watch for fungal diseases. Prepare for Kharif sowing. Check soil moisture \
                     before irrigation. Use raised beds for vegetables to prevent waterlogging.".to_string(),
            category: "weather".to_string(),
            source: "IMD Advisory".to_string(),
        },
        Document {
            title: "Winter Season Farming Tips".to_string(),
            content: "Winter (November-February) is ideal for Rabi crops. Protect crops from frost - use mulching \
                     or smoke. Irrigate during evening to prevent frost damage. This season suits wheat, gram, \
                     mustard, peas. Ensure timely sowing before December end.".to_string(),
            category: "weather".to_string(),
            source: "IMD Advisory".to_string(),
        },
        Document {
            title: "Summer Season Advisory".to_string(),
            content: "Summer (March-May) requires frequent irrigation. Use mulching to retain soil moisture. \
                     Suitable crops: Watermelon, muskmelon, cucumber, okra. Avoid mid-day irrigation. \
                     Provide shade for nurseries. Watch for pest outbreaks in hot weather.".to_string(),
            category: "weather".to_string(),
            source: "IMD Advisory".to_string(),
        },

        // Pest Control
        Document {
            title: "Aphid Control in Vegetables".to_string(),
            content: "Aphids are common pests in leafy vegetables and brassicas. Symptoms: curling leaves, \
                     honeydew deposits. Control: Spray neem oil (5ml/L), or use yellow sticky traps. \
                     Biological control: Release ladybird beetles. Avoid excessive nitrogen fertilization.".to_string(),
            category: "pest_control".to_string(),
            source: "ICAR Pest Management".to_string(),
        },
        Document {
            title: "Stem Borer in Rice".to_string(),
            content: "Yellow stem borer causes 'dead heart' in vegetative stage and 'white ear' at panicle stage. \
                     Control: Remove and destroy affected tillers. Use pheromone traps at 5/ha. Apply Cartap \
                     hydrochloride 4G at 25kg/ha. Avoid late planting. Maintain field sanitation.".to_string(),
            category: "pest_control".to_string(),
            source: "DRR Advisory".to_string(),
        },
        Document {
            title: "Fruit Fly in Vegetables".to_string(),
            content: "Fruit fly damages cucurbits (pumpkin, bitter gourd, cucumber). Maggots bore into fruits. \
                     Control: Use cue-lure traps at 25/ha. Spray Spinosad 45SC at 0.3ml/L. Collect and destroy \
                     fallen fruits. Apply neem cake in soil. Harvest at right maturity.".to_string(),
            category: "pest_control".to_string(),
            source: "IIHR Bangalore".to_string(),
        },

        // Market Prices (Sample data - in real app, fetch from API)
        Document {
            title: "Current Mandi Prices - Maharashtra".to_string(),
            content: "Today's wholesale prices (per quintal): Onion (Red): ₹1,800-2,200, Tomato: ₹1,500-1,800, \
                     Potato: ₹1,200-1,500, Wheat: ₹2,200-2,400, Rice: ₹2,800-3,200, Soybean: ₹4,500-4,800. \
                     Prices vary by mandi and quality grade.".to_string(),
            category: "market_prices".to_string(),
            source: "AgriMarket Portal".to_string(),
        },
        Document {
            title: "MSP Rates 2024-25".to_string(),
            content: "Minimum Support Prices for major crops: Paddy (Common): ₹2,300/qtl, Wheat: ₹2,275/qtl, \
                     Gram: ₹5,440/qtl, Mustard: ₹5,650/qtl, Cotton (Medium): ₹7,020/qtl. MSP ensures farmers \
                     get minimum guaranteed price. Sell at government procurement centers.".to_string(),
            category: "market_prices".to_string(),
            source: "Ministry of Agriculture".to_string(),
        },

        // Soil Management
        Document {
            title: "Soil Testing Importance".to_string(),
            content: "Soil testing should be done every 2-3 years. Collect samples from 0-15cm depth, 10-15 spots \
                     per field. Test for N, P, K, pH, EC, organic carbon. Based on results, apply balanced fertilizers. \
                     Avoid over-fertilization. Contact nearest Krishi Vigyan Kendra for testing.".to_string(),
            category: "soil".to_string(),
            source: "Soil Health Card Scheme".to_string(),
        },
        Document {
            title: "Organic Matter Management".to_string(),
            content: "Maintain soil organic carbon above 0.5%. Add FYM at 10-15 tonnes/ha annually. Use green \
                     manuring with dhaincha or sunhemp. Incorporate crop residues. Vermicompost is excellent for \
                     improving soil structure. Avoid burning stubble.".to_string(),
            category: "soil".to_string(),
            source: "ICAR Soil Science".to_string(),
        },
    ]
}
