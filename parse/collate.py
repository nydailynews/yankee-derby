#!/usr/bin/env python3
# Describe what this does in one line for people who might run head on this file.
import os, sys
import argparse
import doctest

def main(args):
    """ Handle the command line.
        """
    pass

def build_parser(args):
    """ Handle the argparse and make it testable.
        >>> args = build_parser(['--verbose'])
        >>> print(args.verbose)
        True
        """
    parser = argparse.ArgumentParser(usage = '$ python collate.py',
                                        description='''.'''
                                        epilog='')
    parser.add_argument('-v', '--verbose', dest='verbose', default=False, action='store_true')
    parser.add_argument('-t', '--test', dest='test', default=False, action='store_true')
    args = parser.parse_args(args)
    return args

if __name__ == '__main__':
    args = build_parser(sys.argv[1:])

    if args.test == True:
        doctest.testmod(verbose=args.verbose)

    main(args)
