from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext

ext_modules = [
               Extension("inttools",
                         ["inttools.pyx"],
                         libraries=["m"])]

setup(
      name = "IntTools",
      cmdclass = {'build_ext': build_ext},
      ext_modules = ext_modules
)