import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Get or create session ID for anonymous users
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export async function getOrCreateCart(userId: string | null) {
  if (userId) {
    // For authenticated users
    let { data: cart } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('cart')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      cart = newCart;
    }

    return cart;
  } else {
    // For anonymous users
    const sessionId = getSessionId();
    
    let { data: cart } = await supabase
      .from('cart')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!cart) {
      const { data: newCart, error } = await supabase
        .from('cart')
        .insert({ session_id: sessionId })
        .select()
        .single();
      
      if (error) throw error;
      cart = newCart;
    }

    return cart;
  }
}

export async function getCartWithItems(userId: string | null) {
  const cart = await getOrCreateCart(userId);
  
  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(
        *,
        images:product_images(*)
      )
    `)
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    ...cart,
    items: items || [],
  };
}

export async function addToCart(userId: string | null, productId: string, quantity: number = 1) {
  const cart = await getOrCreateCart(userId);

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);
    
    if (error) throw error;
  } else {
    // Add new item
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: productId,
        quantity,
      });
    
    if (error) throw error;
  }
}

export async function updateCartItemQuantity(userId: string | null, itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(userId, itemId);
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);

  if (error) throw error;
}

export async function removeFromCart(userId: string | null, itemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function clearCart(userId: string | null) {
  const cart = await getOrCreateCart(userId);

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id);

  if (error) throw error;
}

export async function getCartItemCount(userId: string | null): Promise<number> {
  try {
    const cart = await getOrCreateCart(userId);
    
    const { data: items } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('cart_id', cart.id);

    if (!items) return 0;

    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
}
