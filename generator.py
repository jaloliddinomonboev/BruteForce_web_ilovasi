import itertools

def generate_passwords(characters, min_len, max_len, max_count=1000):
    count = 0
    for length in range(min_len, max_len + 1):
        for pwd in itertools.product(characters, repeat=length):
            if count >= max_count:
                return
            yield ''.join(pwd)
            count += 1

def calculate_combinations(characters, min_len, max_len):
    total = 0
    char_count = len(characters)
    for length in range(min_len, max_len + 1):
        total += char_count ** length
    return total