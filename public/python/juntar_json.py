import json
import os
import time

# Início da contagem de tempo
inicio = time.time()

# Caminho absoluto da pasta onde o script está localizado
base_path = os.path.dirname(os.path.abspath(__file__))

# Nomes dos arquivos com caminhos completos
arquivo1 = os.path.join(base_path, 'cte_pedidos_jms.json')  # Contém documento_destinatario e pedido_jms
arquivo2 = os.path.join(base_path, 'dados.json')            # Contém CPF / CNPJ e outros dados

# Lê os arquivos
with open(arquivo1, 'r', encoding='utf-8') as f:
    notas = json.load(f)

with open(arquivo2, 'r', encoding='utf-8') as f:
    pedidos = json.load(f)

# Função para normalizar CPF/CNPJ
def limpar_cpf(cpf):
    return ''.join(filter(str.isdigit, cpf))

# Junta os dados pelo CPF/CNPJ
resultado = []

for nota in notas:
    cpf_nota = limpar_cpf(nota["documento_destinatario"])

    for pedido in pedidos:
        cpf_pedido = limpar_cpf(pedido["CPF / CNPJ"])

        if cpf_nota == cpf_pedido:
            combinado = {
                "cpf": cpf_nota,
                "arquivo_xml": nota["arquivo"],
                "pedido_jms": nota["pedido_jms"],
                "detalhes_pedido": pedido
            }
            resultado.append(combinado)
            break  # Assume que há apenas um match por CPF

# Salva o resultado em um novo arquivo
output_path = os.path.join(base_path, 'resultado_combinado.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(resultado, f, ensure_ascii=False, indent=4)

# Fim da contagem de tempo
fim = time.time()
duracao = fim - inicio

# Exibe mensagem com tempo de execução
print(" Arquivo 'resultado_combinado.json' criado com sucesso.")
print(f" Tempo de execução: {duracao:.2f} segundos.")
