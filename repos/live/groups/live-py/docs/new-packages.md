# Create a new package

## New app/service

```
mkdir packages/apps
po new new-package
cd packages/apps/new-package
po install
```

### Setup new package in IntelliJ

If you app is an entry-point, that is it will be run by itself using `poetry run python -m package`, you must add it as a module in IntelliJ.

In IntelliJ, you must also register each virtual env. To do this you create a new "Platform SDK" - this is just how IntelliJ refers to it..

`Platform Settings > SDKs > + > Add Python SDK... > Existing environment`

There is a folder icon in the dialog that will navigate the file tree to your current dir to make it easier to find. Select `.venv/bin/python`.

Select the package folder and click `Mark Directory As > Source Root`.

TODO: We may make a script in the future to automate this.

### Add a local dependency

```
po add ../../libs/foo
# Modify `pyproject.toml` and add `{develop = true}` to the dependency.
# See: https://github.com/python-poetry/poetry/issues/34#issuecomment-696757191
po install
```

NOTE: Don't use `Open Terminal` in IntelliJ. It selects the wrong `.venv`.

# Transitive libs

Transitive deps don't get set as "library root" in IntelliJ which prevents their interpreter being set.

# Shared libs

Shared libs could belong to one or more venvs, so they prob need their own venv when modifying them. Not sure about this one.
