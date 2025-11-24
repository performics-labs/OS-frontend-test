export const storage = {
    getItem<T>(key: string): T | null {
        const value = window.localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : null;
    },
    setItem<T>(key: string, value: T): void {
        window.localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem(key: string): void {
        window.localStorage.removeItem(key);
    },
};
