const input_field = document.querySelector('#pass_input');
let common_pass_set = new Set();

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const lowercase_ascii = alphabet.toLowerCase();
const uppercase_ascii = alphabet;
const symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~\\_";
const unicode_start = 128; // unicode starts from 128 for non-ascii characters
const unicode_end = 1114111; // maximum unicode code point (0x10ffff)
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
    unicode: false
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
        else if (char.charCodeAt(0) > 127) password_props.unicode = true;  // non-ascii characters
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

// estimate cracking time
const calculate_cracking_time = (password, strength) => {
    const time_in_seconds = Math.pow(strength, password.length) / guesses_per_second_gpu;
    console.log(`estimated cracking time: ${format_time(time_in_seconds)}`);
};

// format time in a human-readable format
const format_time = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    return `${(seconds / 31536000).toFixed(2)} years`;
};

// check for common passwords and weak patterns
const check_for_weak_patterns = (password) => {
    if (common_pass_set.has(password.toLowerCase()) && password !== '') {
        console.log(`weak pattern detected: "${password}" - consider changing it!`);
        return;
    }

    const weak_patterns = [
        /\d{3,}/,   // detects numbers in a sequence like '123'
        /[a-z]{3,}/, // detects simple letter sequences like 'abc'
        /([a-z])\1{2,}/, // detects repeated characters like 'aaa'
    ];

    for (let pattern of weak_patterns) {
        if (pattern.test(password)) {
            console.log(`weak password detected: "${password}" due to patterns`);
            return;
        }
    }
    console.log('no weak patterns detected.');
};

// calculate range for unicode characters
const calculate_unicode_range = () => {
    return unicode_end - unicode_start + 1;  // number of distinct unicode characters
};

// attach the event listener to the input field
input_field.addEventListener("input", get_user_input);


