#include "main.h"

#include "Poco/MD5Engine.h"
#include "Poco/DigestStream.h"

#include <iostream>

// Forward def of function in ObjC file.
void foo();

int main(int argc, char **argv) {
  Poco::MD5Engine md5;
  Poco::DigestOutputStream ds(md5);
  ds << "abcdefghijklmnopqrstuvwxyz";
  ds.close();
  std::cout << Poco::DigestEngine::digestToHex(md5.digest()) << std::endl;
  foo();
  return 0;
}
