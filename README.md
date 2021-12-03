# geo-service
### Внимание!
```markdown
Репозиторий еще обновляется!
```

Демо сервиса доступно по адресу: [http://159.69.178.233/](http://159.69.178.233/)

Пользователь не требуется<br>

<h4>Реализованная функциональность</h4>
<ul>
    <li>Фича 1;</li>
    <li>Фича 1;</li>
</ul> 

<h4>Основной стек технологий:</h4>
<ul>
    <li>Jupyter Notebook, NodeJs</li>
	<li>PHP 7, PostgresSql.</li>
	<li>React, HTML, CSS, JavaScript, TypeScript.</li>
	<li>Git, Docker.</li>
 </ul>

#### Среда запуска
1) развертывание сервиса производится на debian-like linux (debian 10+);
2) требуется установленный docker-compose;
3) требуется установленный build-essential и wget
#### Требования
```markdown
CPU - 2 шт
RAM > 10 GB
SSD/HDD > 15 GB
```
Если у вас не установлен docker-compose, то вам потребуется установка описаная в [инструкции](DOCKER.md).



## Подготовка проекта

Клонируем проект и переходим в папку.
```shell
git clone https://github.com/informixter/geo-service.git && cd geo-service
```
Инициализация проекта.Сборка, миграции, сиддинг в БД, скачиваем карты региона. В данном проекте установлен **приволжский федеральный округ** весом 500 MB
```shell
make init
```



## Подготовка проекта
### Внимание!
```markdown
Прогрев движка маршрутов занимает примерно 10-15 минут. Это нормально для такого кол-ва данных.
```
Запустить систему
```shell
make run
```

Остановить систему.
```shell
make run
```

РАЗРАБОТЧИКИ
<h4>Туктарова Алина - Дизайн, презентация, данные</h4>
<h4>Бережнов Дмитрий - fullstack https://t.me/berezh </h4>
<h4>Попов Дмитрий  - backend/devops https://t.me/informix </h4>
