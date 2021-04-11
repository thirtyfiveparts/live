#include "./index.h"

using namespace std;

int example::add(int x, int y) {
  return (x + y);
}

Napi::Number example::addWrapped(const Napi::CallbackInfo &info) {

  Napi::Env env = info.Env();

  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env,
      "arg1::Number, arg2::Number expected").ThrowAsJavaScriptException();
  }

  Napi::Number first = info[0].As<Napi::Number>();
  Napi::Number second = info[1].As<Napi::Number>();

  Napi::Number out = Napi::Number::New(env,
    example::add(first.Int32Value(), second.Int32Value()));

  return out;
}

Napi::Object example::Init(Napi::Env env, Napi::Object exports) {
  //export Napi function
  exports.Set("add", Napi::Function::New(env, example::addWrapped));
  return exports;
}
