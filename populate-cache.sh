#!/usr/bin/env sh
#readarray <<HERE
#https://github.com/apache/commons-lang
#https://github.com/apache/flink
#HERE
#
#for repo in "${MAPFILE[@]}"; do
#    echo "Cloning ${repo}"
#    git clone "${repo}" "$1"
#done

mkdir -p "$1"
cd "$1"
git clone https://github.com/apache/commons-io apache/commons-io
git clone https://github.com/apache/hadoop apache/hadoop
git clone https://github.com/hibernate/hibernate-search hibernate/hibernate-search
git clone https://github.com/checkstyle/checkstyle checkstyle/checkstyle
git clone https://github.com/apache/flink apache/flink
git clone https://github.com/javaparser/javaparser javaparser/javaparser
git clone https://github.com/junit-team/junit5 junit-team/junit5
git clone https://github.com/square/okhttp square/okhttp

#git clone https://github.com/apache/commons-lang apache/commons-lang
#git clone https://github.com/apache/flink apache/flink
#git clone https://github.com/apache/lucene-solr apache/lucene-solr
#git clone https://github.com/checkstyle/checkstyle checkstyle/checkstyle
#git clone https://github.com/eclipse/jetty.project eclipse/jetty.project
#git clone https://github.com/hibernate/hibernate-orm hibernate/hibernate-orm
#git clone https://github.com/hibernate/hibernate-search hibernate/hibernate-search
#git clone https://github.com/javaparser/javaparser javaparser/javaparser
#git clone https://github.com/JetBrains/intellij-community JetBrains/intellij-community
#git clone https://github.com/kiegroup/drools kiegroup/drools
#git clone https://github.com/mockito/mockito mockito/mockito
#git clone https://github.com/spring-projects/spring-boot spring-projects/spring-boot
#git clone https://github.com/tensorflow/models tensorflow/models
#git clone https://github.com/keras-team/keras keras-team/keras
#git clone https://github.com/pallets/flask pallets/flask
#git clone https://github.com/scikit-learn/scikit-learn scikit-learn/scikit-learn
#git clone https://github.com/zulip/zulip zulip/zulip
#git clone https://github.com/pandas-dev/pandas pandas-dev/pandas
#git clone https://github.com/django/django django/django
#git clone https://github.com/shobrook/rebound shobrook/rebound
#git clone https://github.com/asciinema/asciinema asciinema/asciinema
#git clone https://github.com/jakubroztocil/httpie jakubroztocil/httpie
