import os
import xml.etree.ElementTree as ET
import json

print("Iniciando a extração de dados dos CT-es...")

# Caminho da pasta com os XMLs
pasta_xml = r"C:\Users\atend\OneDrive\Documentos\GitHub\rastreamento\public\python\cte"

# Caminho onde o JSON será salvo
pasta_saida = r"C:\Users\atend\OneDrive\Documentos\GitHub\rastreamento\public\python"
arquivo_saida = os.path.join(pasta_saida, "cte_pedidos_jms.json")

# Namespace XML
ns = {'cte': 'http://www.portalfiscal.inf.br/cte'}

# Lista para armazenar os dados
dados_extraidos = []
total_processados = 0

# Ler todos os XMLs da pasta
for nome_arquivo in os.listdir(pasta_xml):
    if nome_arquivo.endswith(".xml"):
        caminho_arquivo = os.path.join(pasta_xml, nome_arquivo)
        print(f"Processando arquivo: {nome_arquivo}")
        total_processados += 1

        try:
            tree = ET.parse(caminho_arquivo)
            root = tree.getroot()

            # CPF/CNPJ do destinatário
            dest = root.find('.//cte:dest', ns)
            cpf = dest.find('cte:CPF', ns) if dest is not None else None
            cnpj = dest.find('cte:CNPJ', ns) if dest is not None else None
            doc_dest = cpf.text if cpf is not None else (cnpj.text if cnpj is not None else '')

            # Buscar Pedido JMS
            pedido_jms = ''
            obs_cont = root.findall('.//cte:ObsCont', ns)  # Corrigido: letra maiúscula

            for obs in obs_cont:
                xcampo = obs.attrib.get('xCampo', '').lower()
                if 'pedido' in xcampo and 'jms' in xcampo:
                    xtexto = obs.find('cte:xTexto', ns)
                    if xtexto is not None:
                        pedido_jms = xtexto.text.strip()
                        break

            # Tentar obsFisco se não encontrou
            if not pedido_jms:
                obs_fisco = root.findall('.//cte:ObsFisco', ns)  # Também letra maiúscula
                for obs in obs_fisco:
                    xtexto = obs.find('cte:xTexto', ns)
                    if xtexto is not None and ('pedido' in xtexto.text.lower() or 'jms' in xtexto.text.lower()):
                        pedido_jms = xtexto.text.strip()
                        break

            # Adicionar dados
            dados_extraidos.append({
                "arquivo": nome_arquivo,
                "documento_destinatario": doc_dest,
                "pedido_jms": pedido_jms
            })

        except Exception as e:
            print(f"Erro ao processar '{nome_arquivo}': {e}")

# Salvar JSON
with open(arquivo_saida, "w", encoding="utf-8") as f:
    json.dump(dados_extraidos, f, ensure_ascii=False, indent=4)

print(f"\n✅ Extração finalizada. {total_processados} arquivos processados.")
print(f"📄 Arquivo JSON salvo em: {arquivo_saida}")
