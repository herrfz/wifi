from libc.math cimport log, sqrt


def gcd(int a, int b):
    '''gcd(a, b): compute greatest common denominator of two integers
        
        a, b: integers
        '''
    while b:
        a, b = b, a % b
    return a


def lcm(int a, int b):
    '''lcm(a, b): compute least common multiple of two integers
        
        a, b: integers
        '''
    return a * b // gcd(a, b)


def lcmm(*args):
    '''lcmm(a, b, ... ): compute least common multiple of a number of integers
        
        other usage: lcmm(*args)
        
        *args: a list of integers
        '''
    return reduce(lcm, args)


def isprime(int n):
    '''isprime(n): test if an integer is a prime
        
        n: integer
        '''
    cdef int i 
    
    if n <= 1:
        return False
    
    # this is more like an exception
    elif n in [2, 3]:
        return True
    
    elif n > 2 and n % 2 == 0:
        return False
    elif n > 3 and ((n + 1) % 6 == 0 or (n - 1) % 6 == 0):
        for i in xrange(2, int(sqrt(n)) + 1):
            if n % i == 0:
                return False
            else:
                continue
    else:
        return False
    
    # if it doesn't fall into any of the 'if' traps, then it's a prime
    return True


def sieve(int n):
    '''sieve(n): sieve method to generate prime numbers up to n
        
        n: integer
        return: list of primes
        '''
    cdef int i, j, prime
    
    if n <= 1:
        return []
    
    else:
    
        A = [0, 0] + [1 for _ in xrange(n-1)]
    
        for i in xrange(2, int(n**.5) + 1):
            if A[i] == 1:
                for j in xrange(i*i, n+1, i):
                    A[j] = 0
    
        return [i for i, prime in enumerate(A) if prime]


def sieve2(int n):
    '''sieve2(n): sieve method to generate prime numbers up to n
        
        similar to the 'sieve' function, except that a generator is returned 
        instead of a list.
        
        this is more efficient if n is very large, since the primes are 
        generated 'on the fly' instead of being stored in the memory.
        
        if a list of primes is not strictly needed, it is recommended to use
        this method instead of 'sieve'
        
        The A matrix use to compute the sieve still takes a lot of memory, though
        '''
    cdef int i, j
    
    if n <= 1:
        raise StopIteration
    
    else:
    
        A = [0, 0] + [1 for _ in xrange(n-1)]
    
        for i in xrange(2, n + 1):
            if A[i] == 1:
                if i < (int(n**.5) + 1):
                    for j in xrange(i*i, n+1, i):
                        A[j] = 0
            
                yield i


def nth_prime(int n):
    '''nth_prime(n): compute the nth prime number, using the bound from 
        http://mathdl.maa.org/images/cms_upload/jaroma03200545640.pdf
        
        pn <= n * ln(n) + n * (ln(ln(n)) - 0.9385)
        
        and then sieve to get the nth prime
        '''
    cdef int pn
    
    if n<=0:
        return None
    
    else:
        j = 1

        # there are fewer primes under 5016 than the bound pn above
        # hence this exception
        if n<=5016:
            pn = 50000
        else:
            pn = int( n * log(n) + n * (log(log(n)) - 0.9385) )

        for i in sieve2(pn):
            if j==n:
                p = i
                break
            else:
                j += 1
    
        return p


def prime_divisors(int n):
    '''prime_divisors(n): compute the prime divisors of an integer n
        
        n: integer
        return: list of prime divisors
        '''
    cdef int v
    
    if n <= 1:
        return None
    
    v = int(sqrt(n))
    
    while v > 1:
        if n % v == 0:
            if v == 1:
                return prime_divisors(v) + []
            else:
                return prime_divisors(v) + prime_divisors(n/v)
        
        v -= 1
    
    return [n]


def divisors(int n):
    '''divisors(n): compute the divisors of an integer n
        
        n: integer
        return: list of divisors 1..n
        '''
    cdef int i
    divs = []
    
    for i in xrange(1, int(n**.5) + 1):
        if n % i == 0:
            divs.append(i)
            divs.append((n // i))
    
    return list(set(divs))