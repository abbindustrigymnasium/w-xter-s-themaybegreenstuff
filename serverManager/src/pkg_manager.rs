use std::fs;
use toml::Value;
use std::env;
use std::path::Path;

fn handle_dependencies(config: &toml::Value) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(dependencies) = config.get("dependencies") {
        println!("Dependencies:");
        if let Some(table) = dependencies.as_table() {
            for (key, value) in table {
                println!("- {}: {}", key, value);
            }
        } else {
            println!("The 'dependencies' section is not a valid table.");
        }
    } else {
        println!("The 'dependencies' section is missing in the TOML file.");
    }
    Ok(())
}

fn resolve_toml_file(toml_path: &Path, silent: bool) -> Result<toml::Value, Box<dyn std::error::Error>> {
    if !silent {
        println!("Current working directory: {}", env::current_dir()?.display());
        println!("Relative path to TOML file: {}", toml_path.display());
    }

    // Attempt to resolve the absolute path
    let absolute_path = match toml_path.canonicalize() {
        Ok(path) => {
            if !silent {
                println!("Absolute path to TOML file: {}", path.display());
            }
            path
        }
        Err(e) => {
            if !silent {
                eprintln!("Error resolving path: {}", e);
            }
            return Err(Box::new(e));
        }
    };

    // Read the TOML file (if found)
    let file_contents = fs::read_to_string(&absolute_path)?;
    if !silent {
        println!("TOML File Contents:\n{}", file_contents);
    }

    // Return the parsed TOML value
    let toml_value: Value = toml::from_str(&file_contents)?;
    Ok(toml_value)
}\




pub fn run() {
    let toml_path = Path::new("../serverConf/serverConf.toml");

    // Handle errors properly with `match`
    match resolve_toml_file(toml_path, true) {
        Ok(toml_value) => {
            // Call the dependencies handler
            if let Err(e) = handle_dependencies(&toml_value) {
                eprintln!("Error handling dependencies: {}", e);
            }
        }
        Err(e) => {
            eprintln!("Failed to resolve TOML file: {}", e);
        }
    }
}
