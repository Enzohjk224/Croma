create database Croma;
use Croma;
create table usuario(

	email varchar(200) primary key,
    senha varchar(100) not null,
    nome varchar (100) not null,
    formula varchar (100) not null,
    peso int (3) not null,
    altura int (3) not null,
    idade int (3) not null,
    genero varchar (50) not null,
    fator_atividade varchar (100) not null
    
    
);
drop table usuario;
