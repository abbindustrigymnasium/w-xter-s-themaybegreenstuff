use std::path::Path;
use std::error::Error;
use tempfile::TempDir;

#[cfg(test)]
mod tests {
    use super::*;

#[test]
fn test_resolve_toml_file_success() {
    let temp_dir = TempDir::new().unwrap();
    let toml_path = temp_dir.path().join("test.toml");
    let toml_content = r#"
        [section]
        key = "value"
    "#;
    fs::write(&toml_path, toml_content).unwrap();

    let result = resolve_toml_file(&toml_path, true);
    assert!(result.is_ok());

    let toml_value = result.unwrap();
    assert_eq!(toml_value["section"]["key"].as_str(), Some("value"));
}

#[test]
fn test_resolve_toml_file_non_existent_path() {
    let temp_dir = TempDir::new().unwrap();
    let non_existent_path = temp_dir.path().join("non_existent.toml");

    let result = resolve_toml_file(&non_existent_path, true);
    assert!(result.is_err());

    let error = result.unwrap_err();
    assert!(error.to_string().contains("No such file or directory"));
}
}
