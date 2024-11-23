// variable to store weak patterns - variable to store time to crack
window.time_to_crack = undefined; window.weak_pattern = [false, null, null];

// define used throughout vars
const input_field = document.querySelector('#pass_input');
let common_pass_set = new Set();

const numbers = '0123456789';
const lowercase_ascii = 'abcdefghijklmnopqrstuvwxyz';
const uppercase_ascii = lowercase_ascii.toUpperCase();
const symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~\\_";

// unicode subsets for specific character types
const emoji_range = [0x1F600, 0x1F64F];  // emoticons
const math_symbols_range = [0x2200, 0x22FF];  // mathematical operators
const cjk_range = [0x4E00, 0x9FFF];  // cjk ideographs
const currency_symbols_range = [0x20A0, 0x20CF];  // currency symbols
const letter_like_range = [0x1D400, 0x1D7FF];  // letter-like symbols

// check against weak patterns
const weak_patterns = [
    /\d{3,}/,   // detects numbers in a sequence like '123'
    /[a-z]{3,}/, // detects simple letter sequences like 'abc'
    /([a-z])\1{2,}/, // detects repeated characters like 'aaa'
];

// ambiguous data
const common_pass_url = 'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/10-million-password-list-top-100000.txt';
const guesses_per_second_gpu = 100000000000; // guesses per second for modern pc, https://nordpass.com/blog/brute-force-attack/

// caching common passwords in localstorage or fetch if not present
const load_common_passwords = async () => {
    if (localStorage.getItem('common_pass_set')) {
        common_pass_set = new Set(JSON.parse(localStorage.getItem('common_pass_set')));
    } else {
        try {
            const response = await fetch(common_pass_url);
            if (!response.ok) throw new Error('failed to fetch common passwords');
            const text = await response.text();
            common_pass_set = new Set(text.split("\n").map(pass => pass.toLowerCase()));
            localStorage.setItem('common_pass_set', JSON.stringify([...common_pass_set])); // cache for next session
        } catch (error) {
            console.error('error:', error);
        }
    }
};
load_common_passwords();

// initial state of password character properties
const password_props = {
    numbers: false,
    lowercase: false,
    uppercase: false,
    symbols: false,
    whitespace: false,
    unicode: false,
    emoji: false,
    math_symbols: false,
    cjk: false,
    currency_symbols: false,
    letter_like: false,
};

// handle input and trigger strength check
const get_user_input = () => {
    const input_content = input_field.value;
    if (input_content) {
        update_password_props(input_content);
    }
};

// update password property booleans based on the input content
const update_password_props = (password) => {
    // reset the properties
    Object.keys(password_props).forEach(key => password_props[key] = false);

    for (let char of password) {
        if (numbers.includes(char)) password_props.numbers = true;
        else if (lowercase_ascii.includes(char)) password_props.lowercase = true;
        else if (uppercase_ascii.includes(char)) password_props.uppercase = true;
        else if (symbols.includes(char)) password_props.symbols = true;
        else if (char === ' ') password_props.whitespace = true;
        else if (char.charCodeAt(0) > 127) {
            // check for specific unicode subsets
            const code = char.charCodeAt(0);

            if (is_emoji(code)) password_props.emoji = true;
            if (is_math_symbol(code)) password_props.math_symbols = true;
            if (is_cjk(code)) password_props.cjk = true;
            if (is_currency_symbol(code)) password_props.currency_symbols = true;
            if (is_letter_like(code)) password_props.letter_like = true;
            password_props.unicode = true;  // it's a non-ascii character
        }
    }

    password_strength_check(password);
};

// calculate password strength and other properties
const password_strength_check = (password) => {
    let strength = 0;

    // add strength based on character categories used
    if (password_props.numbers) strength += numbers.length;
    if (password_props.lowercase) strength += lowercase_ascii.length;
    if (password_props.uppercase) strength += uppercase_ascii.length;
    if (password_props.symbols) strength += symbols.length;
    if (password_props.whitespace) strength += 1;
    if (password_props.unicode) strength += calculate_unicode_range();

    // calculate password entropy
    const entropy = password.length * Math.log2(strength);
    console.log(`password strength multiplier: ${strength}`);
    console.log(`entropy: ${entropy.toFixed(2)} bits`);

    // estimate cracking time
    calculate_cracking_time(password, strength);

    // check for weak patterns in the password
    check_for_weak_patterns(password);
};

// format time in a human-readable format
const format_time = (seconds) => {
    if (seconds > 31556952000000) {
        return `more than 10 million years`;
    }

    if (seconds < 60) return `${seconds.toFixed(0)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(0)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(0)} days`;
    return `${(seconds / 31536000).toFixed(0)} years`;
};

// estimate cracking time
const calculate_cracking_time = (password, strength) => {
    let x = Math.pow(strength, password.length) / guesses_per_second_gpu;
    window.time_to_crack = format_time(x)

    // output the time to crack
    console.log(`time: ${window.time_to_crack}`);
};

// check for common passwords and weak patterns
const check_for_weak_patterns = (password) => {
    if (common_pass_set.has(password.toLowerCase()) && password !== '') {
        window.weak_pattern[0] = true
        window.weak_pattern[1] = password

        // output the weak password
        console.log(`weak password: "${password}"`);
        return;
    }

    for (let pattern of weak_patterns) {
        if (pattern.test(password)) {
            // push the weak pattern to the array
            window.weak_pattern[0] = true
            window.weak_pattern[2] = pattern

            // output the weak pattern
            console.log(`weak pattern: "${pattern}"`);
            return;
        }
    }

    // reset the array
    window.weak_pattern[0] = false;
    window.weak_pattern[1] = null;
    window.weak_pattern[2] = null;
};

// calculate range for unicode characters
const calculate_unicode_range = () => {
    let unicode_strength = 0;

    // count characters in different unicode subsets
    if (password_props.emoji) unicode_strength += emoji_range[1] - emoji_range[0] + 1;
    if (password_props.math_symbols) unicode_strength += math_symbols_range[1] - math_symbols_range[0] + 1;
    if (password_props.cjk) unicode_strength += cjk_range[1] - cjk_range[0] + 1;
    if (password_props.currency_symbols) unicode_strength += currency_symbols_range[1] - currency_symbols_range[0] + 1;
    if (password_props.letter_like) unicode_strength += letter_like_range[1] - letter_like_range[0] + 1;

    return unicode_strength;
};

// helper functions to check specific unicode ranges
const is_emoji = (code) => code >= emoji_range[0] && code <= emoji_range[1];
const is_math_symbol = (code) => code >= math_symbols_range[0] && code <= math_symbols_range[1];
const is_cjk = (code) => code >= cjk_range[0] && code <= cjk_range[1];
const is_currency_symbol = (code) => code >= currency_symbols_range[0] && code <= currency_symbols_range[1];
const is_letter_like = (code) => code >= letter_like_range[0] && code <= letter_like_range[1];

// attach the event listener to the input field
input_field.addEventListener("input", get_user_input);


