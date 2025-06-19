import pandas as pd
import os

def converter_para_json(arquivo_entrada, arquivo_saida):
    # Verifica a extensão do arquivo
    extensao = os.path.splitext(arquivo_entrada)[1]

    try:
        if extensao == '.xlsx':
            df = pd.read_excel(arquivo_entrada)
        elif extensao == '.csv':
            df = pd.read_csv(arquivo_entrada)
        else:
            print("Formato de arquivo não suportado. Use .xlsx ou .csv.")
            return

        # Exporta para JSON (com identação e sem caracteres especiais codificados)
        df.to_json(arquivo_saida, orient='records', indent=4, force_ascii=False)
        print(f"Arquivo JSON salvo como: {arquivo_saida}")

    except Exception as e:
        print(f"Erro durante a conversão: {e}")

# ==== EXEMPLO DE USO ====
entrada = 'pedidos.xlsx'      # Nome da sua planilha de entrada
saida = 'pedidos.json'        # Nome do arquivo JSON de saída

converter_para_json(entrada, saida)
