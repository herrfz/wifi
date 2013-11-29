from inttools import *
import pandas as pd
import numpy as np
from collections import Counter

'''gcd tests'''
def gcd_test():
    # each entry is a triplet (a, b, c) where gcd(a, b) = c
    testcases = [ (13, 13, 13),              # trick case: a = b
                  (37, 600, 1),              # first argument is a prime
                  (20, 100, 20),             # one is multiple of other
                  (624129, 2061517, 18913) ] # straightforward case

    for a, b, solution in testcases:
        assert gcd(a, b) == solution, 'wrong gcd %d, %d, %d' % (a, b, gcd(a, b))


'''lcm tests'''

'''lcmm tests'''


''' prime testing tests'''
# TBD: how to ensure the reference file hasn't been altered? hash?
df = pd.read_table('../10000.txt', \
                    skiprows=4, header=None, sep=r'\s+')
df = df.ix[:999].applymap(int)
primes = df.values.flatten()

#test for false negatives to the 10000th
def fn_test():
    for i in primes:
        assert isprime(i), 'false negative on %d' % i

#test for false positives to the 10000th
not_primes = filter(lambda x: x not in primes, xrange(max(primes)))

def fp_test():
    for i in not_primes:
        assert not isprime(i), 'false positive on %d' % i


'''prime divisors tests'''
def primediv_test():
    # duplicate-factor case
    assert Counter(prime_divisors(20)) == Counter([2, 2, 5])
    # undefined cases
    assert prime_divisors(1) == None 
    assert prime_divisors(-5) == None
    # large prime case
    assert prime_divisors(104729) == [104729] 
    assert Counter(prime_divisors(111435)) == Counter([3, 5, 17, 19, 23])


def sieve_test():
    # basic low prime cases
    assert sieve(2) == [2]
    assert sieve(3) == [2, 3]
    assert sieve(5) == [2, 3, 5]
    # up to the 20th primes
    assert ( sieve(71) == primes[:20] ).all()
    # undefined cases
    assert sieve(0) == []
    assert sieve(1) == []
    assert sieve(-1) == []


def nth_prime_test():
    # undefined cases
    assert nth_prime(0) is None
    assert nth_prime(-1) is None
    # basic low prime cases
    assert nth_prime(1) == 2
    assert nth_prime(2) == 3
    assert nth_prime(3) == 5
    # 100th prime
    assert nth_prime(101) == primes[100]
    # boundary cases
    assert nth_prime(5016) == primes[5015]
    assert nth_prime(5017) == primes[5016]