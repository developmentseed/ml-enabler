FROM python:3.6.3-jessie

ENV HOME=/home/hot

WORKDIR $HOME

COPY ./ $HOME/task-pop
WORKDIR $HOME/task-pop

RUN \
  pip install --upgrade pip \
  pip install -r requirements.txt

CMD python -m pop.handler
