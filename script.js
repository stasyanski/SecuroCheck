let input_field = document.querySelector('#pass_input');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const lowercase_ascii = alphabet.toLowerCase();
const uppercase_ascii = alphabet;
const symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~\\_";
const unicode_characters = 2034 ; // most common unicode characters-- https://gist.github.com/ivandrofly/0fe20773bd712b303f78
const GUESSES_PER_SECOND = 1000000000; // estimated guesses per second for a supercomputer -- https://nordpass.com/blog/brute-force-attack/
const common_pass_url = 'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/10-million-password-list-top-100000.txt' // most common 100,000 passwords github raw txt file
let common_pass_array;

const array = {
    numbers_bool: false,
    lowercase_bool: false,
    uppercase_bool: false,
    symbols_bool: false,
    whitespace: false,
    unicode: false
};

// iife wrapped function to parse the github raw link, ln9 variable
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
        })
        .catch(error => {
            console.error('Error:', error);
        });
})();

const get_user_input = () =>{
    let input_content = input_field.value;
    if (input_content !== '' || null) {
        array_set(input_content)
    }
}

const array_set = (password) => {
    // reset previous values
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
            array.unicode = true; // check for Unicode characters (non-ASCII)
        }
    }
    password_strength_check(password);
};

// function to calculate password strength and entropy
const password_strength_check = (password) => {
    let password_strength = 0;

    // add character set sizes based on what the password contains
    if (array.numbers_bool) {
        password_strength += numbers.length;
    }
    if (array.lowercase_bool) {
        password_strength += lowercase_ascii.length;
    }
    if (array.uppercase_bool) {
        password_strength += uppercase_ascii.length;
    }
    if (array.symbols_bool) {
        password_strength += symbols.length;
    }
    if (array.whitespace) {
        password_strength += 1; // treat whitespace as a special character
    }
    if (array.unicode) {
        password_strength += unicode_characters; // consider Unicode characters
    }

    // calculate entropy
    let combinations = Math.pow(password_strength, password.length);
    console.log(`Combinations: ${combinations}`);
    const entropy = password.length * Math.log2(password_strength);
    console.log(`Password Strength Multiplier: ${password_strength}`);
    console.log(`Entropy: ${entropy.toFixed(2)} bits`);

    // estimate cracking time
    // let time = Math.pow(2, entropy) / GUESSES_PER_SECOND;
    let time = combinations / Math.pow(10,10);
    console.log( time);
    console.log(`Estimated Cracking Time: ${formatTime(time)}`);

    // check for weak password patterns (e.g., common dictionary words)
    check_for_weak_patterns(password);
};

// function to format the estimated cracking time in a human-readable format
const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    return `${(seconds / 31536000).toFixed(2)} years`;
};

const check_for_weak_patterns = (password) => {
    for (let pattern of common_pass_array) {
        if (password.toLowerCase() == pattern) {
            console.log(`Weak pattern detected: "${pattern}" we recommend changing your password`);
            return;
        }
    }
    console.log('No weak patterns detected.');
};

input_field.addEventListener("input", get_user_input);

