import torch 
from typing import Optional
from .code.clip import tokenize, _transform

def get_feature(model, query_sketch: Optional[torch.Tensor] = None, query_text: Optional[str] = None) -> torch.Tensor:
    """
    Get combined feature embedding from sketch and text inputs.
    Handles cases where either input might be empty/None.
    
    Parameters:
    -----------
    model : torch.nn.Module
        The CLIP model
    query_sketch : Optional[torch.Tensor]
        The preprocessed sketch tensor
    query_text : Optional[str]
        The caption text
        
    Returns:
    --------
    torch.Tensor
        The fused feature embedding
    """
    model = model.cuda().eval()
    
    # Handle empty sketch
    if query_sketch is None:
        sketch_feature = torch.zeros((1, 512)).cuda()
    else:
        preprocess_val = _transform(model.visual.input_resolution, is_train=False)
        transformer = preprocess_val
        img1 = transformer(query_sketch).unsqueeze(0).cuda()
        with torch.no_grad():
            sketch_feature = model.encode_sketch(img1)
            sketch_feature = sketch_feature / sketch_feature.norm(dim=-1, keepdim=True)
    
    # Handle empty caption
    if not query_text:
        text_feature = torch.zeros((1, 512)).cuda()
    else:
        txt = tokenize([str(query_text)])[0].unsqueeze(0).cuda()
        with torch.no_grad():
            text_feature = model.encode_text(txt)
            text_feature = text_feature / text_feature.norm(dim=-1, keepdim=True)
    
    return model.feature_fuse(sketch_feature, text_feature)
