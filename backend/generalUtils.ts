class PrettyConsole {
    private colors = {
        reset: '\x1b[0m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        success: '\x1b[32m',
        separator: '\x1b[36m',
        info: '\x1b[34m',
    };

    private separator = '--------------------------';

    private formatMessage(label: string, labelColor: string, message: string): string {
        return `${labelColor}${label}:${this.colors.reset} ${message}`;
    }

    public logWarning(message: string, details?: any): void {
        console.log(this.formatMessage('Warning', this.colors.warning, message));
        if (details) {
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
            console.log(details);
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
        }
    }

    public logUnsafe(message: string, details?: any): void {
        console.log(this.formatMessage('Unsafe', this.colors.error, message));
        if (details) {
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
            console.log(details);
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
        }
    }

    public logError(message: string, details?: any): void {
        console.error(this.formatMessage('Error', this.colors.error, message));
        if (details) {
            console.error(`${this.colors.separator}${this.separator}${this.colors.reset}`);
            console.error(details.stack || details.message || details);
            console.error(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
        }
    }

    public logSuccess(message: string, details?: any): void {
        console.log(this.formatMessage('Success', this.colors.success, message));
        if (details) {
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}`);
            console.log(details);
            console.log(`${this.colors.separator}${this.separator}${this.colors.reset}\n`);
        }
    }

    public logInfo(message: string): void {
        console.log(this.formatMessage('Info', this.colors.info, message));
    }
}

export default PrettyConsole;
