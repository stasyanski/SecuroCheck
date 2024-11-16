let input_field = document.querySelector('#pass_input');
let common_pass_array;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const lowercase_ascii = alphabet.toLowerCase();
const uppercase_ascii = alphabet;
const symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~\\_";
const unicode_start = 128; // unicode starts from 128 for non-ASCII characters
const unicode_end = 1114111; // maximum unicode code point (0x10FFFF)
const common_pass_url = 'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt'; // 1 million most common passwords Raw Github

const GUESSES_PER_SECOND_GPU = 100000000000; // estimate guesses per second for modern GPU (100 billion guesses per second)

// caching common passwords in localStorage to avoid repeated fetching
if (localStorage.getItem('common_pass_array')) {
    common_pass_array = JSON.parse(localStorage.getItem('common_pass_array'));
} else {
    (function() {
        fetch(common_pass_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failure to reach Raw Github User Content');
                }
                return response.text();
            })
            .then(text => {
                common_pass_array = text.split("\n");  // split the text into an array by newlines
                localStorage.setItem('common_pass_array', JSON.stringify(common_pass_array)); // store in cache
            })
            .catch(error => {
                console.error('Error:', error);
            });
    })();
}

// array to hold bool values on password complexity calculation
const array = {
    numbers_bool: false,
    lowercase_bool: false,
    uppercase_bool: false,
    symbols_bool: false,
    whitespace: false,
    unicode: false
};

// get user input from the input field
const get_user_input = () => {
    let input_content = input_field.value;
    if (input_content !== '' || input_content !== null) {
        array_set(input_content);
    }
};

// update the array object based on password content (character types)
const array_set = (password) => {
    // reset previous values on input filed update
    array.numbers_bool = array.lowercase_bool = array.uppercase_bool = array.symbols_bool = array.whitespace = array.unicode = false;

    // check each character in the password
    for (let char of password) {
        if (numbers.includes(char)) {
            array.numbers_bool = true;
        } else if (lowercase_ascii.includes(char)) {
            array.lowercase_bool = true;
        } else if (uppercase_ascii.includes(char)) {
            array.uppercase_bool = true;
        } else if (symbols.includes(char)) {
            array.symbols_bool = true;
        } else if (char === ' ') {
            array.whitespace = true;
        } else if (char.charCodeAt(0) > 127) {
            array.unicode = true; // check for unicode characters (non-ASCII)
        }
    }
    password_strength_check(password);
};

// calculate the password strength and cracking time
const password_strength_check = (password) => {
    let password_strength = 0;

    // add character set sizes based on what the password contains
    if (array.numbers_bool) password_strength += numbers.length;
    if (array.lowercase_bool) password_strength += lowercase_ascii.length;
    if (array.uppercase_bool) password_strength += uppercase_ascii.length;
    if (array.symbols_bool) password_strength += symbols.length;
    if (array.whitespace) password_strength += 1;
    if (array.unicode) password_strength += calculate_unicode_range();

    // log the computed password strength
    console.log(`Password Strength Multiplier: ${password_strength}`);

    // calculate entropy (password complexity)
    const entropy = password.length * Math.log2(password_strength);
    console.log(`Entropy: ${entropy.toFixed(2)} bits`);

    // estimate cracking time
    calculate_cracking_time(password, password_strength);

    // check for weak patterns or dictionary words
    check_for_weak_patterns(password);
};

// function to calculate the number of distinct Unicode characters available
const calculate_unicode_range = () => {
    const unicode_range = unicode_end - unicode_start + 1;
    console.log(`Unicode characters range: ${unicode_range}`);
    return unicode_range; // return the number of distinct Unicode characters from 128 to 1114111
};

// function to format the estimated cracking time in a human-readable format
const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    return `${(seconds / 31536000).toFixed(2)} years`;
};

// password cracking time estimation
const calculate_cracking_time = (password, password_strength) => {
    const length = password.length;
    let timeInSeconds = Math.pow(password_strength, length) / GUESSES_PER_SECOND_GPU;
    console.log(`Estimated Cracking Time: ${formatTime(timeInSeconds)}`);
    return timeInSeconds;
};

// check for weak patterns
const check_for_weak_patterns = (password) => {
    if (common_pass_array.includes(password.toLowerCase()) && password !== '') {
        console.log(`Weak pattern detected: "${password}" - Consider changing it!`);
        return;
    }
    // Regex
    const weak_patterns = [
        /\d{3,}/,   // detects numbers in a sequence like '123', '456'
        /[a-z]{3,}/, // detects simple letter sequences like 'abc'
        /([a-z])\1{2,}/, // detects repeated characters like 'aaa', 'bbb'
    ];

    for (let pattern of weak_patterns) {
        if (pattern.test(password)) {
            console.log(`Weak password detected: "${password}" due to patterns`);
            return;
        }
    }
    console.log('No weak patterns detected.');
};

// attach the event listener to the input field
input_field.addEventListener("input", get_user_input);

