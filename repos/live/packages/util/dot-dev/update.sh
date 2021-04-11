#!/usr/bin/env bash

set -x

# ln -i = confirm replace

# TODO(vjpr): Need to create intermediary dirs. mkdir -p. Is there an `ln` flag?

# What do you call the dir where a tool keeps its configs/logs/etc?
# home/data/config

# Postgres
mkdir -p .dev/config/postgresql
ln -si /usr/local/var/postgres .dev/config/postgresql/config
ln -si /usr/local/var/postgres/postgresql.conf .dev/config/postgresql/postgresql.conf
ln -si /usr/local/var/postgresql@9.6/postgresql.conf .dev/config/postgresql/postgresql@9.6.conf
ln -si /usr/local/var/log/postgres.log .dev/config/postgresql/postgresql.log

# Mosquitto
mkdir -p .dev/config/mosquitto
ln -si /usr/local/etc/mosquitto .dev/config/mosquitto/config
ln -si /usr/local/etc/mosquitto/mosquitto.conf .dev/config/mosquitto/mosquitto.conf
ln -si /usr/local/var/log/mosquitto.log .dev/config/mosquitto/mosquitto.log

# emqttd
mkdir -p .dev/config/emqtt
ln -si ~/bin/emqttd .dev/config/emqtt/home

# TODO: nginx
