use tracing::debug;

use super::knowledge_base::{get_all_documents, Document};

/// Simple TF-IDF-like retriever that finds relevant documents based on keyword matching.
/// For production, this should be replaced with a proper vector DB like Qdrant.

pub async fn retrieve(query: &str) -> (Vec<String>, Vec<String>) {
    let documents = get_all_documents();
    let query_lower = query.to_lowercase();
    let query_terms: Vec<&str> = query_lower.split_whitespace().collect();
    
    // Score each document based on term frequency
    let mut scored_docs: Vec<(f32, &Document)> = documents
        .iter()
        .map(|doc| {
            let content_lower = doc.content.to_lowercase();
            let title_lower = doc.title.to_lowercase();
            
            let mut score = 0.0;
            for term in &query_terms {
                // Count occurrences in content
                let content_matches = content_lower.matches(term).count() as f32;
                // Title matches are weighted higher
                let title_matches = title_lower.matches(term).count() as f32 * 2.0;
                // Category matches
                let category_match = if doc.category.to_lowercase().contains(term) { 1.5 } else { 0.0 };
                
                score += content_matches + title_matches + category_match;
            }
            
            (score, doc)
        })
        .filter(|(score, _)| *score > 0.0)
        .collect();

    // Sort by score descending
    scored_docs.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    // Take top 3 results
    let top_docs: Vec<&Document> = scored_docs.iter().take(3).map(|(_, doc)| *doc).collect();

    debug!("Retrieved {} documents for query: '{}'", top_docs.len(), query);

    let contents: Vec<String> = top_docs.iter().map(|d| format!("[{}] {}", d.title, d.content)).collect();
    let sources: Vec<String> = top_docs.iter().map(|d| d.source.clone()).collect();

    (contents, sources)
}

/// Alternative keyword-based retrieval for specific farming topics
#[allow(dead_code)]
pub fn retrieve_by_category(category: &str) -> Vec<Document> {
    get_all_documents()
        .into_iter()
        .filter(|doc| doc.category.to_lowercase() == category.to_lowercase())
        .collect()
}
