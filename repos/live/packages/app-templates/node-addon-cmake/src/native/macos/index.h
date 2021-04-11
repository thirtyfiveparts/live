#include <napi.h>
#include <iostream>

using namespace std;

namespace example {

  int add(int x, int y);

  Napi::Number addWrapped(const Napi::CallbackInfo &info);

  Napi::Object Init(Napi::Env env, Napi::Object exports);

  NODE_API_MODULE(addon, Init);

}
