FROM amazonlinux:latest
ENV LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN=1
RUN yum -y install gcc
RUN yum -y install mysql
RUN yum -y install mysql-devel
RUN yum -y install MySQL-python
RUN yum -y install python-devel
RUN yum -y install openldap-devel
RUN yum -y install crontabs
RUN yum -y install nginx
RUN yum -y install memcached memcached-devel libmemcached-devel
RUN curl https://bootstrap.pypa.io/get-pip.py | python
RUN yum -y install mysql56 mysql56-devel python27-devel
RUN rm /usr/lib/python2.7/dist-packages/chardet-2.0.1.egg-info
RUN rm -r /usr/lib/python2.7/dist-packages/chardet
RUN pip install requests
RUN pip install --upgrade pip

# node env
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum -y install yarn

ADD ./package.json /requiments/
ADD ./yarn.lock /requiments/

WORKDIR /requiments/

RUN yarn global add pm2 backpack-core && yarn

ADD . /app/
WORKDIR /app/
