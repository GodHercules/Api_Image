import sys
import imageio.v3 as imageio  # Usando a API mais recente do Imageio

def process_image(image_path):
    try:
        img = imageio.imread(image_path)  # Lê a imagem
        height, width = img.shape[:2]    # Obtém altura e largura
        return f"Imagem processada: {width}x{height} pixels"
    except Exception as e:
        return f"Erro ao processar imagem: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Nenhum caminho de arquivo fornecido")
        sys.exit(1)

    image_path = sys.argv[1]
    result = process_image(image_path)
    print(result)
