import csv
import json
import os

# Caminho dos arquivos 
pasta = os.path.dirname(__file__)
arquivo_csv = os.path.join(pasta, 'vendas2406.csv')
arquivo_json = os.path.join(pasta, 'dados.json')

# Passo 1 – Converter CSV para JSON (mesmo que colunas venham "coladas")
dados_json = []

with open(arquivo_csv, mode='r', encoding='latin1') as csvfile:
    leitor = csv.reader(csvfile, delimiter=';')
    cabecalhos = next(leitor)  # primeira linha = cabeçalhos

    for linha in leitor:
        if not any(linha):  # ignora linha vazia
            continue
        registro = dict(zip(cabecalhos, linha))
        dados_json.append(registro)

# Salvar JSON bruto
with open(arquivo_json, mode='w', encoding='utf-8') as jsonfile:
    json.dump(dados_json, jsonfile, ensure_ascii=False, indent=2)

print("CSV convertido para JSON com sucesso!")

# Passo 2 – Extrair CPFs e nomes corretamente
print("\nLista de CPFs encontrados:\n")

for pedido in dados_json:
    nome = pedido.get("Nome do comprador", "Nome não encontrado")
    cpf = pedido.get("CPF / CNPJ", "CPF não encontrado")

