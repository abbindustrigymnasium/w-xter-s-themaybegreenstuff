use serde::Deserialize;
use std::path::Path;
use std::fs;

#[derive(Deserialize)]
struct Config {
    database: Database,
}

#[derive(Deserialize)]
struct Database {
    user: String,
}

/**
 * This function reads a TOML file at the specified path and deserializes it into a `Config` struct.
 */
fn read_toml_file<P: AsRef<Path>>(path: P) -> Result<Config, Box<dyn std::error::Error>> {
    let file_contents = fs::read_to_string(path)?; // Handles std::io::Error
    let config = toml::from_str(&file_contents)?;  // Handles toml::de::Error
    Ok(config)
}

fn main() {
    // Print current working directory for debugging purposes
    println!(
        "Current working directory: {:?}",
        std::env::current_dir().unwrap()
    );

    let path = Path::new(r"..\serverConf\serverConf.toml");

    // Check if the file can be found at specified path
    if path.exists() {
        println!("Found serverConf.toml at {}", path.display());
    } else {
        panic!("Could not find serverConf.toml at {}", path.display());
    }

    // Read and parse the TOML file
    match read_toml_file(path) {
        Ok(config) => {
            println!("Parsed serverConf.toml successfully!");
            //println!("Database port: {}", config.database.port);
        }
        Err(e) => {
            eprintln!("Error: Failed to parse serverConf.toml: {}", e);
        }
    }
}
