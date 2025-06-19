
export class Dict {
    constructor() {
        this.m_keys = [];
        this.m_values = [];
    }
    get length() {
        return this.m_keys.length;
    }
    get values() {
        return this.m_values.concat();
    }
    get keys() {
        return this.m_keys.concat();
    }
    indexOf(key) {
        return this.m_keys.indexOf(key);
    }
    add(key, value) {
        var index = this.indexOf(key);
        if (index >= 0) {
            this.m_values[index] = value;
        }
        else {
            this.m_keys.push(key);
            this.m_values.push(value);
        }
    }
    get(key) {
        var index = this.indexOf(key);
        if (index >= 0) {
            return this.m_values[index];
        }
        return null;
    }
    remove(key) {
        var index = this.indexOf(key);
        if (index >= 0) {
            this.m_keys.splice(index, 1);
            return this.m_values.splice(index, 1)[0];
        }
        return null;
    }
    clear() {
        this.m_keys.length = 0;
        this.m_keys = [];
        this.m_values.length = 0;
        this.m_values = [];
    }
    getRandomData() {
        var index = Math.random() * this.keys.length << 0;
        return this.m_values[index];
    }
    getRandomKey() {
        var index = Math.random() * this.keys.length << 0;
        return this.m_keys[index];
    }
}


