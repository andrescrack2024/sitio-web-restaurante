import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeft, Save, X, Info, Lock, Unlock, Copy, Check, Key, HelpCircle, Volume2, VolumeX, Mail } from 'lucide-react';
import { storage, isFirebaseSupported } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Admin({
  menuItems,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  onGoBack,
  adminSettings,
  onUpdateAdminSettings
}) {
  const adminPassword = adminSettings?.password || 'admin123';
  const adminQuestion = adminSettings?.securityQuestion || '¿Cuál es el nombre de tu cliente principal?';
  const adminAnswer = adminSettings?.securityAnswer || 'edwin';
  const adminHash = adminSettings?.secureHash || 'admin_chocquin_9924';
  const adminEmail = adminSettings?.adminEmail || 'sharlyandresmosquerarodriguez@gmail.com';
  const emailjsServiceId = adminSettings?.emailjsServiceId || '';
  const emailjsTemplateId = adminSettings?.emailjsTemplateId || '';
  const emailjsPublicKey = adminSettings?.emailjsPublicKey || '';
  const audioNotifications = adminSettings?.audioNotifications !== false;
  const voiceNotifications = adminSettings?.voiceNotifications !== false;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos', 'menu', or 'seguridad'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'hamburguesas',
    description: '',
    badge: '',
    image: '',
    ingredients: ''
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Recovery & PIN states
  const [loginMode, setLoginMode] = useState('login'); // 'login', 'recovery', 'enter_pin', 'reset'
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    password: adminPassword,
    secureHash: adminHash,
    securityQuestion: adminQuestion,
    securityAnswer: adminAnswer,
    adminEmail: adminEmail,
    emailjsServiceId: emailjsServiceId,
    emailjsTemplateId: emailjsTemplateId,
    emailjsPublicKey: emailjsPublicKey,
    audioNotifications: audioNotifications,
    voiceNotifications: voiceNotifications
  });

  // Sync security form when adminSettings updates
  useEffect(() => {
    if (adminSettings) {
      setSecurityForm({
        password: adminSettings.password || 'admin123',
        secureHash: adminSettings.secureHash || 'admin_chocquin_9924',
        securityQuestion: adminSettings.securityQuestion || '¿Cuál es el nombre de tu cliente principal?',
        securityAnswer: adminSettings.securityAnswer || 'edwin',
        adminEmail: adminSettings.adminEmail || 'sharlyandresmosquerarodriguez@gmail.com',
        emailjsServiceId: adminSettings.emailjsServiceId || '',
        emailjsTemplateId: adminSettings.emailjsTemplateId || '',
        emailjsPublicKey: adminSettings.emailjsPublicKey || '',
        audioNotifications: adminSettings.audioNotifications !== false,
        voiceNotifications: adminSettings.voiceNotifications !== false
      });
    }
  }, [adminSettings]);

  const compressAndReadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Web-Optimized JPEG (approx. 20KB - 50KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Simulate upload progress for UI feedback
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          setUploadProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setFormData((prev) => ({ ...prev, image: compressedBase64 }));
            setIsUploading(false);
            setUploadProgress(0);
          }
        }, 100);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert("Error al procesar el archivo de imagen.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    compressAndReadImage(file);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'hamburguesas': return 'Hamburguesas';
      case 'perros': return 'Perros';
      case 'salchipapas': return 'Salchipapas';
      case 'bebidas': return 'Bebidas';
      case 'especiales': return 'Especiales / Combos';
      default: return cat;
    }
  };

  const printComanda = (order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes (popups) para poder imprimir la comanda.");
      return;
    }
    
    const itemsHtml = order.items.map(item => {
      const saucesHtml = item.sauces && item.sauces.length > 0
        ? `<div style="font-size: 18px; font-style: italic; margin-top: 4px; color: #333;">Salsas: ${item.sauces.join(', ')}</div>`
        : '';
      return `
        <tr>
          <td style="padding: 15px 0; font-size: 24px; vertical-align: top;">${item.quantity}x</td>
          <td style="padding: 15px 0; font-size: 24px; vertical-align: top;">
            <b>${item.name}</b>
            ${saucesHtml}
          </td>
          <td style="text-align: right; padding: 15px 0; font-size: 24px; vertical-align: top;">$${(item.price * item.quantity).toLocaleString('es-CO')}</td>
        </tr>
      `;
    }).join('');

    const dateFormatted = new Date(order.createdAt).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';

    printWindow.document.write(`
      <html>
      <head>
        <title>Comanda - Pedido #${orderNum}</title>
        <style>
          @page {
            size: letter;
            margin: 10mm;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px;
            color: #000;
            background-color: #fff;
            box-sizing: border-box;
          }
          .ticket-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 100%;
            box-sizing: border-box;
          }
          .text-center { text-align: center; }
          .double-divider { border-top: 5px double #000; margin: 15px 0; }
          .dashed-divider { border-top: 3px dashed #000; margin: 15px 0; }
          .solid-divider { border-top: 4px solid #000; margin: 15px 0; }
          .header { font-size: 48px; font-weight: bold; letter-spacing: 1px; }
          .subheader { font-size: 30px; font-weight: bold; margin-top: 5px; }
          .total { font-size: 36px; font-weight: bold; }
          .badge { border: 4px solid #000; padding: 18px; font-weight: bold; text-align: center; font-size: 28px; margin-top: 15px; text-transform: uppercase; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <!-- TOP SECTIONS -->
          <div>
            <div class="text-center header">RÁPIDO & DELI</div>
            <div class="text-center subheader">TICKET DE COCINA</div>
            
            <div class="double-divider"></div>
            
            <div class="info-row">
              <span><b>FECHA:</b> ${dateFormatted}</span>
              <span><b>PEDIDO:</b> #${orderNum}</span>
            </div>
            
            <div class="solid-divider"></div>
            
            <div style="font-size: 24px; line-height: 1.6; margin: 15px 0;">
              <div><b>CLIENTE:</b> ${order.clientName}</div>
              <div><b>TELÉFONO:</b> ${order.clientPhone}</div>
              <div><b>DIRECCIÓN:</b> ${order.clientAddress}</div>
            </div>
            
            <div class="solid-divider"></div>
          </div>
          
          <!-- MIDDLE ITEMS TABLE SECTION -->
          <div style="flex-grow: 1; margin: 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="border-bottom: 3px solid #000;">
                  <th align="left" style="padding-bottom: 12px; font-size: 24px;">Cant</th>
                  <th align="left" style="padding-bottom: 12px; font-size: 24px;">Producto</th>
                  <th align="right" style="padding-bottom: 12px; font-size: 24px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          
          <!-- BOTTOM SECTIONS -->
          <div>
            <div class="dashed-divider"></div>
            
            <div class="total" style="display: flex; justify-content: space-between;">
              <span>TOTAL DEL PEDIDO:</span>
              <span>$${order.total.toLocaleString('es-CO')}</span>
            </div>
            
            <div class="solid-divider"></div>
            <div style="font-size: 24px; margin-bottom: 15px;"><b>PAGO:</b> ${order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi' || order.paymentMethod === 'mixto' ? (order.paymentMethod === 'mixto' ? '🔄 PAGO MIXTO (TRANSFERENCIA + EFECTIVO)' : '💳 TRANSFERENCIA (LLAVE/NEQUI)') : '💵 EFECTIVO CONTRA ENTREGA'}</div>
            
            <div class="badge">
              ${order.status === 'pendiente' && (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi' || order.paymentMethod === 'mixto') 
                ? '⚠️ PAGO POR VERIFICAR (WhatsApp)' 
                : '⚠️ PEDIDO AUTORIZADO - COCINA'}
            </div>
            
            <div class="double-divider"></div>
            
            <div class="text-center" style="font-size: 22px; font-weight: bold; margin-top: 15px;">¡A preparar con calidad y rapidez! 🍔🔥</div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleStatusChange = (order, newStatus) => {
    if ((newStatus === 'en cocina' || newStatus === 'en camino' || newStatus === 'entregado') && 
        order.status === 'pendiente' && 
        (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi' || order.paymentMethod === 'mixto')) {
      const confirmed = window.confirm(
        `🚨 CONTROL DE PAGO 🚨\n\nEste pedido requiere pago por TRANSFERENCIA (Transfiya/Nequi/Mixto).\n\n¿Ya verificaste el comprobante de pago o captura en WhatsApp y recibiste la transferencia?`
      );
      if (!confirmed) {
        const openWA = window.confirm(`¿Deseas abrir el chat de WhatsApp de ${order.clientName} para verificar el comprobante?`);
        if (openWA) {
          let phone = order.clientPhone.replace(/\D/g, '');
          if (phone.length === 10 && !phone.startsWith('57')) {
            phone = '57' + phone;
          }
          window.open(`https://wa.me/${phone}`, '_blank');
        }
        return;
      }
    }
    onUpdateOrderStatus(order.id, newStatus);
  };

  const handleAcceptOrder = (order) => {
    if (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi' || order.paymentMethod === 'mixto') {
      const confirmed = window.confirm(
        `🚨 CONTROL DE PAGO 🚨\n\nEste pedido requiere pago por TRANSFERENCIA (Transfiya/Nequi/Mixto).\n\n¿Ya verificaste el comprobante de pago o captura en WhatsApp y recibiste la transferencia?`
      );
      if (!confirmed) {
        const openWA = window.confirm(`¿Deseas abrir el chat de WhatsApp de ${order.clientName} para verificar el comprobante?`);
        if (openWA) {
          let phone = order.clientPhone.replace(/\D/g, '');
          if (phone.length === 10 && !phone.startsWith('57')) {
            phone = '57' + phone;
          }
          window.open(`https://wa.me/${phone}`, '_blank');
        }
        return;
      }
    }

    // 1. Change status to 'en cocina'
    onUpdateOrderStatus(order.id, 'en cocina');
    
    // 2. Open print dialog
    printComanda(order);
    
    // 3. Open WhatsApp chat with confirmation
    const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';
    const message = `¡Hola, ${order.clientName}! 🍔 Tu pedido #${orderNum} de Rápido & Deli ya fue recibido y entró en preparación en la cocina. En breve te enviaremos el comprobante. ¡Muchas gracias!`;
    
    let phone = order.clientPhone.replace(/\D/g, '');
    if (phone.length === 10 && !phone.startsWith('57')) {
      phone = '57' + phone;
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const sendStatusWhatsApp = (order) => {
    const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';
    let message = '';
    
    if (order.status === 'pendiente') {
      message = `¡Hola, ${order.clientName}! 🍔 Hemos recibido tu pedido #${orderNum} en Rápido & Deli. Estamos procesándolo y validándolo en nuestro sistema. ¡Muchas gracias por tu paciencia!`;
    } else if (order.status === 'en cocina') {
      message = `¡Hola, ${order.clientName}! 🍔 Tu pedido #${orderNum} ya está en la cocina y nuestros cocineros lo están preparando con el mejor sabor de Rápido & Deli. 🔥 ¡Te avisaremos apenas vaya en camino!`;
    } else if (order.status === 'en camino') {
      message = `¡Hola, ${order.clientName}! 🛵 Tu pedido #${orderNum} de Rápido & Deli ya va en camino a tu dirección: ${order.clientAddress}. Nuestro repartidor llegará muy pronto. ¡Buen provecho!`;
    } else if (order.status === 'entregado') {
      message = `¡Hola, ${order.clientName}! 🎉 Tu pedido #${orderNum} de Rápido & Deli ha sido entregado con éxito. ¡Esperamos que disfrutes de tu comida! Agradecemos mucho tu compra y tu preferencia. 🍔🍟🥤`;
    } else if (order.status === 'cancelado') {
      message = `Hola, ${order.clientName}. Lamentamos informarte que tu pedido #${orderNum} de Rápido & Deli ha sido cancelado. Si tienes alguna duda, por favor comunícate con nosotros por esta línea.`;
    }
    
    // Format phone with Colombian country prefix if needed
    let phone = order.clientPhone.replace(/\D/g, '');
    if (phone.length === 10 && !phone.startsWith('57')) {
      phone = '57' + phone;
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'hamburguesas',
      description: '',
      badge: '',
      image: '',
      ingredients: ''
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      badge: product.badge || '',
      image: product.image || '',
      ingredients: Array.isArray(product.ingredients) 
        ? product.ingredients.join(', ') 
        : product.ingredients || ''
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.price) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número mayor a 0';
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Use default fallback image if none provided
    const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
    const finalProduct = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      badge: formData.badge.trim() || undefined,
      image: formData.image.trim() || defaultImage,
      ingredients: formData.ingredients.trim()
        ? formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '')
        : []
    };

    if (editingProduct) {
      onUpdateProduct({ ...finalProduct, id: editingProduct.id });
    } else {
      onAddProduct(finalProduct);
    }
    
    setIsFormOpen(false);
  };

  const handleDeleteClick = (id, name) => {
    if (window.confirm(`¿Está seguro de que desea eliminar "${name}" del menú?`)) {
      onDeleteProduct(id);
    }
  };

  const handlePinClick = (num) => {
    if (loginMode === 'login') {
      setPassword(prev => prev + num);
      if (loginError) setLoginError('');
    } else if (loginMode === 'enter_pin') {
      setEnteredPin(prev => (prev + num).slice(0, 6));
      if (recoveryError) setRecoveryError('');
    } else if (loginMode === 'reset') {
      setNewPassword(prev => prev + num);
      if (recoveryError) setRecoveryError('');
    }
  };

  const handlePinDelete = () => {
    if (loginMode === 'login') {
      setPassword(prev => prev.slice(0, -1));
    } else if (loginMode === 'enter_pin') {
      setEnteredPin(prev => prev.slice(0, -1));
    } else if (loginMode === 'reset') {
      setNewPassword(prev => prev.slice(0, -1));
    }
  };

  const handlePinClear = () => {
    if (loginMode === 'login') {
      setPassword('');
    } else if (loginMode === 'enter_pin') {
      setEnteredPin('');
    } else if (loginMode === 'reset') {
      setNewPassword('');
    }
  };

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setPassword('');
      setLoginError('Contraseña incorrecta. Intente de nuevo.');
    }
  };

  const handleRecoverySubmit = async (e) => {
    if (e) e.preventDefault();
    if (recoveryEmail.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      setRecoveryError('El correo electrónico no coincide con el registrado.');
      return;
    }

    const generatedPin = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const updatedSettings = {
      ...adminSettings,
      recoveryPin: generatedPin,
      recoveryExpiresAt: expiresAt
    };
    onUpdateAdminSettings(updatedSettings);

    const serviceId = adminSettings?.emailjsServiceId;
    const templateId = adminSettings?.emailjsTemplateId;
    const publicKey = adminSettings?.emailjsPublicKey;

    if (serviceId && templateId && publicKey) {
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              to_name: 'Administrador',
              to_email: adminEmail,
              recovery_pin: generatedPin,
              expires_in: '5 minutos'
            }
          })
        });

        if (response.ok) {
          console.log('Correo de recuperación enviado con éxito.');
        } else {
          console.warn('Fallo al enviar correo con EmailJS. Código devuelto:', response.status);
        }
      } catch (err) {
        console.error('Error al realizar envío por EmailJS:', err);
      }
    } else {
      console.log('⚠️ EmailJS no configurado. Código de recuperación generado:', generatedPin);
      alert(`[Modo Desarrollo] EmailJS no configurado en Seguridad. Tu código PIN de 6 dígitos es: ${generatedPin}`);
    }

    setLoginMode('enter_pin');
    setRecoveryError('');
    setEnteredPin('');
  };

  const handlePinVerificationSubmit = (e) => {
    if (e) e.preventDefault();
    const storedPin = adminSettings?.recoveryPin;
    const expiresAt = adminSettings?.recoveryExpiresAt;

    if (!storedPin || !expiresAt) {
      setRecoveryError('No se encontró ningún PIN de recuperación activo.');
      return;
    }

    if (Date.now() > expiresAt) {
      setRecoveryError('El PIN de recuperación ha expirado. Genere uno nuevo.');
      return;
    }

    if (enteredPin === storedPin) {
      setLoginMode('reset');
      setRecoveryError('');
    } else {
      setRecoveryError('PIN de recuperación incorrecto.');
    }
  };

  const handleResetPasswordSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newPassword.trim()) {
      setRecoveryError('La contraseña no puede estar vacía.');
      return;
    }
    const updated = {
      ...adminSettings,
      password: newPassword.trim(),
      recoveryPin: null,
      recoveryExpiresAt: null
    };
    onUpdateAdminSettings(updated);
    
    setPassword(newPassword.trim());
    setNewPassword('');
    setLoginMode('login');
    alert('Contraseña restablecida con éxito. Ya puedes ingresar con tu nueva contraseña.');
  };

  const handleSecurityFormSubmit = (e) => {
    e.preventDefault();
    if (!securityForm.password.trim()) {
      alert('La contraseña no puede estar vacía.');
      return;
    }
    if (!securityForm.secureHash.trim()) {
      alert('La ruta segura no puede estar vacía.');
      return;
    }
    if (!securityForm.adminEmail.trim()) {
      alert('El correo electrónico de administración no puede estar vacío.');
      return;
    }
    
    const normalizedHash = securityForm.secureHash.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!normalizedHash) {
      alert('La ruta segura contiene caracteres no válidos.');
      return;
    }

    const updated = {
      ...adminSettings,
      password: securityForm.password.trim(),
      secureHash: normalizedHash,
      securityQuestion: securityForm.securityQuestion.trim(),
      securityAnswer: securityForm.securityAnswer.trim(),
      adminEmail: securityForm.adminEmail.trim(),
      emailjsServiceId: securityForm.emailjsServiceId.trim(),
      emailjsTemplateId: securityForm.emailjsTemplateId.trim(),
      emailjsPublicKey: securityForm.emailjsPublicKey.trim(),
      audioNotifications: securityForm.audioNotifications !== false,
      voiceNotifications: securityForm.voiceNotifications !== false
    };

    onUpdateAdminSettings(updated);
    alert('Configuración de seguridad guardada con éxito.');
  };

  const accessUrl = `${window.location.origin}/#${securityForm.secureHash}`;
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(accessUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Puedes copiarlo manualmente: ' + accessUrl);
      });
  };

  const renderPinPad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginTop: '15px',
        maxWidth: '300px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {digits.map((digit) => {
          let style = {
            height: '56px',
            fontSize: '1.25rem',
            fontWeight: '700',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            touchAction: 'manipulation',
            transition: 'all 0.1s ease',
            padding: 0
          };
          if (digit === 'C') {
            style.backgroundColor = 'rgba(255, 69, 58, 0.1)';
            style.color = '#ff453a';
            style.borderColor = 'rgba(255, 69, 58, 0.2)';
          } else if (digit === '⌫') {
            style.backgroundColor = 'rgba(222, 142, 0, 0.1)';
            style.color = 'var(--accent-gold)';
            style.borderColor = 'rgba(222, 142, 0, 0.2)';
          }
          return (
            <button
              key={digit}
              type="button"
              onClick={() => {
                if (digit === 'C') {
                  handlePinClear();
                } else if (digit === '⌫') {
                  handlePinDelete();
                } else {
                  handlePinClick(digit);
                }
              }}
              style={style}
              className="pin-button"
            >
              {digit}
            </button>
          );
        })}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <section className="admin-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
        <div className="modal-content animate-slide-up" style={{ position: 'static', maxWidth: '420px', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          {loginMode === 'login' && (
            <>
              <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--accent-gold-light)', margin: '0 auto 20px' }}>
                <Lock size={24} className="text-gold" />
              </div>
              <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Acceso Restringido</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Ingrese la contraseña de administración.
              </p>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    className="form-control"
                    placeholder="Contraseña"
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', height: '52px' }}
                    required
                    autoFocus
                  />
                  {loginError && <p className="form-error" style={{ textAlign: 'center', marginTop: '8px' }}>{loginError}</p>}
                </div>

                {renderPinPad()}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '1rem', marginTop: '24px', marginBottom: '16px' }}>
                  Ingresar al Panel
                </button>
              </form>
              
              <button 
                onClick={() => {
                  setLoginMode('recovery');
                  setRecoveryError('');
                  setRecoveryEmail('');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', border: '1px solid var(--border-color)', marginBottom: '12px', height: '44px' }}
              >
                <HelpCircle size={16} style={{ marginRight: '6px' }} /> Olvidé mi contraseña
              </button>
            </>
          )}

          {loginMode === 'recovery' && (
            <>
              <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--accent-gold-light)', margin: '0 auto 20px' }}>
                <HelpCircle size={24} className="text-gold" />
              </div>
              <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Recuperación de Contraseña</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Ingrese su dirección de correo electrónico administrador registrado para recibir un PIN de 6 dígitos.
              </p>

              <form onSubmit={handleRecoverySubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="form-control"
                    placeholder="ejemplo@correo.com"
                    style={{ textAlign: 'center', fontSize: '1.1rem', height: '52px' }}
                    required
                    autoFocus
                  />
                  {recoveryError && <p className="form-error" style={{ textAlign: 'center', marginTop: '8px' }}>{recoveryError}</p>}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '1rem', marginBottom: '16px' }}>
                  Enviar PIN de Recuperación
                </button>
              </form>
              
              <button 
                onClick={() => {
                  setLoginMode('login');
                  setLoginError('');
                  setPassword('');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', border: '1px solid var(--border-color)', height: '44px' }}
              >
                <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Volver al Login
              </button>
            </>
          )}

          {loginMode === 'enter_pin' && (
            <>
              <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--accent-gold-light)', margin: '0 auto 20px' }}>
                <Key size={24} className="text-gold" />
              </div>
              <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Verificar PIN</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Hemos enviado un código PIN al correo electrónico. Ingréselo a continuación.
              </p>

              <form onSubmit={handlePinVerificationSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="form-control"
                    placeholder="PIN de 6 dígitos"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold', height: '52px' }}
                    required
                    autoFocus
                  />
                  {recoveryError && <p className="form-error" style={{ textAlign: 'center', marginTop: '8px' }}>{recoveryError}</p>}
                </div>

                {renderPinPad()}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '1rem', marginTop: '24px', marginBottom: '16px' }}>
                  Verificar PIN
                </button>
              </form>
              
              <button 
                onClick={() => {
                  setLoginMode('recovery');
                  setRecoveryError('');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', border: '1px solid var(--border-color)', marginBottom: '12px', height: '44px' }}
              >
                Volver a enviar código
              </button>

              <button 
                onClick={() => {
                  setLoginMode('login');
                  setLoginError('');
                  setPassword('');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', border: '1px solid var(--border-color)', height: '44px' }}
              >
                Cancelar
              </button>
            </>
          )}

          {loginMode === 'reset' && (
            <>
              <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--accent-gold-light)', margin: '0 auto 20px' }}>
                <Key size={24} className="text-gold" />
              </div>
              <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Restablecer Contraseña</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Cree una nueva contraseña para su cuenta de administrador.
              </p>

              <form onSubmit={handleResetPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    className="form-control"
                    placeholder="Nueva Contraseña"
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', height: '52px' }}
                    required
                    autoFocus
                  />
                  {recoveryError && <p className="form-error" style={{ textAlign: 'center', marginTop: '8px' }}>{recoveryError}</p>}
                </div>

                {renderPinPad()}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '1rem', marginTop: '24px', marginBottom: '16px' }}>
                  Guardar Contraseña
                </button>
              </form>
              
              <button 
                onClick={() => {
                  setLoginMode('login');
                  setLoginError('');
                  setPassword('');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', border: '1px solid var(--border-color)', height: '44px' }}
              >
                Cancelar
              </button>
            </>
          )}
          
          <div style={{ margin: '20px 0 10px 0', borderTop: '1px solid var(--border-color)' }}></div>

          <button onClick={onGoBack} className="btn btn-secondary" style={{ width: '100%', textTransform: 'none', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: 'transparent' }}>
            <ArrowLeft size={16} /> Regresar al Sitio
          </button>
        </div>
      </section>
    );
  }

  // Filter active and history orders
  const activeOrders = orders.filter(order => 
    order.status === 'pendiente' || 
    order.status === 'cocina' || 
    order.status === 'camino'
  );

  const rawHistoryOrders = orders.filter(order => 
    order.status === 'entregado' || 
    order.status === 'cancelado'
  );

  const historyOrders = rawHistoryOrders.filter(order => {
    if (!orderSearchTerm.trim()) return true;
    const client = order.clientName || '';
    const items = order.items || [];
    const itemsString = items.map(i => i.name).join(' ');
    const searchString = `${client} ${order.id || ''} ${itemsString}`.toLowerCase();
    return searchString.includes(orderSearchTerm.toLowerCase().trim());
  });

  const audioMuted = adminSettings?.audioNotifications === false;
  const voiceMuted = adminSettings?.voiceNotifications === false;

  const toggleQuickAudio = () => {
    const updated = {
      ...adminSettings,
      audioNotifications: audioMuted
    };
    setSecurityForm(prev => ({ ...prev, audioNotifications: audioMuted }));
    onUpdateAdminSettings(updated);
  };

  const toggleQuickVoice = () => {
    const updated = {
      ...adminSettings,
      voiceNotifications: voiceMuted
    };
    setSecurityForm(prev => ({ ...prev, voiceNotifications: voiceMuted }));
    onUpdateAdminSettings(updated);
  };

  return (
    <section className="admin-section">
      <div className="container">
        {/* Header Row */}
        <div className="admin-header-row animate-slide-up">
          <div className="admin-title-group">
            <h2 className="font-serif">Panel de Control</h2>
            <p>Gestión de pedidos en tiempo real y catálogo de platos del restaurante.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quick Mute Toggles */}
            <button 
              type="button"
              onClick={toggleQuickAudio}
              className={`pos-tactile-btn ${audioMuted ? 'danger' : 'success'}`} 
              style={{ padding: '8px 12px', minHeight: '44px', textTransform: 'none' }}
              title={audioMuted ? "Activar Sonido" : "Mutear Sonido"}
            >
              {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>{audioMuted ? "🔇 Mudo" : "🔊 Sonido"}</span>
            </button>
            <button 
              type="button"
              onClick={toggleQuickVoice}
              className={`pos-tactile-btn ${voiceMuted ? 'danger' : 'success'}`} 
              style={{ padding: '8px 12px', minHeight: '44px', textTransform: 'none' }}
              title={voiceMuted ? "Activar Voz" : "Mutear Voz"}
            >
              {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>{voiceMuted ? "🔇 Voz" : "🗣️ Voz"}</span>
            </button>

            <button onClick={onGoBack} className="pos-tactile-btn" style={{ textTransform: 'none' }}>
              <ArrowLeft size={16} /> Volver al Sitio
            </button>
            {activeTab === 'menu' && (
              <button onClick={openAddModal} className="pos-tactile-btn primary" style={{ textTransform: 'none' }}>
                <Plus size={16} /> Agregar Producto
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="admin-tabs animate-slide-up" style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('pedidos'); setOrderSearchTerm(''); }} 
            className={`pos-tactile-btn ${activeTab === 'pedidos' ? 'primary' : ''}`}
            style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
          >
            📋 Pedidos Activos ({activeOrders.length})
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('historial'); setOrderSearchTerm(''); }} 
            className={`pos-tactile-btn ${activeTab === 'historial' ? 'primary' : ''}`}
            style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
          >
            ⏳ Historial ({historyOrders.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('menu')} 
            className={`pos-tactile-btn ${activeTab === 'menu' ? 'primary' : ''}`}
            style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
          >
            🍔 Gestionar Menú ({menuItems.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('seguridad')} 
            className={`pos-tactile-btn ${activeTab === 'seguridad' ? 'primary' : ''}`}
            style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}
          >
            🔒 Seguridad
          </button>
        </div>

        {/* Info Box */}
        <div 
          className="animate-slide-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            textAlign: 'left'
          }}
        >
          <Info size={24} className="text-gold" style={{ flexShrink: 0 }} />
          {activeTab === 'pedidos' ? (
            <p>
              Aquí puedes ver los pedidos a domicilio en curso. Utiliza el botón <b>Validar Transferencia</b> para verificar pagos, o presiona <b>Imprimir Comanda</b> para la cocina. Al completarlos o cancelarlos pasarán al historial.
            </p>
          ) : activeTab === 'historial' ? (
            <p>
              Historial de pedidos atendidos (Entregados o Cancelados). Puedes utilizar el buscador táctil en la parte superior para localizar rápidamente un pedido por nombre, ID o productos.
            </p>
          ) : activeTab === 'menu' ? (
            <p>
              Gestiona el catálogo de platos. Los cambios realizados aquí se sincronizan automáticamente con la base de datos de Firestore en la nube y se reflejan al instante en la carta digital del cliente.
            </p>
          ) : (
            <p>
              Configura los parámetros de seguridad del panel: cambia tu contraseña de acceso, el correo de recuperación y personaliza las notificaciones táctiles de pedidos.
            </p>
          )}
        </div>

        {activeTab === 'pedidos' && (
          /* Pedidos en Vivo Grid list */
          <div className="orders-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {activeOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No hay pedidos activos por preparar o entregar en este momento.
              </div>
            ) : (
              activeOrders.map((order) => {
                const dateObj = new Date(order.createdAt);
                const timeString = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString('es-CO');
                const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';

                return (
                  <div 
                    key={order.id} 
                    className="order-card animate-slide-up"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Row: Order ID, Time and Status Dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                          Pedido #{orderNum}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                          {dateString} • {timeString}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.85rem',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            backgroundColor: order.status === 'pendiente' ? 'rgba(222, 142, 0, 0.15)' : 'rgba(37, 211, 102, 0.15)',
                            color: order.status === 'pendiente' ? '#de8e00' : '#25d366',
                            border: '1px solid currentColor'
                          }}
                        >
                          {order.status === 'pendiente' && '🕒 Pendiente'}
                          {order.status === 'en cocina' && '🍳 En Cocina'}
                          {order.status === 'en camino' && '🛵 En Camino'}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Content Section: Domicilio & Productos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Left: Shipping details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Datos de Entrega</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0, fontSize: '1.05rem' }}>👤 <b>{order.clientName}</b></p>
                          <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            📞 <a href={`tel:${order.clientPhone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>{order.clientPhone}</a>
                          </p>
                          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>📍 {order.clientAddress}</p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                            Pago: 
                            <span 
                              style={{ 
                                marginLeft: '6px', 
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: order.paymentMethod === 'mixto'
                                  ? 'rgba(52, 152, 219, 0.15)'
                                  : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                    ? 'rgba(37,211,102,0.1)'
                                    : 'rgba(222,142,0,0.1)',
                                color: order.paymentMethod === 'mixto'
                                  ? '#3498db'
                                  : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                    ? '#25d366'
                                    : 'var(--accent-gold)'
                              }}
                            >
                              {order.paymentMethod === 'mixto'
                                ? '🔄 Pago Mixto'
                                : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                  ? '💳 Transferencia'
                                  : '💵 Contra Entrega'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Order list */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Detalles del Pedido</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name} <b style={{ color: 'var(--accent-gold)' }}>x{item.quantity}</b></span>
                                <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                              {item.sauces && item.sauces.length > 0 && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '12px' }}>
                                  Salsas: {item.sauces.join(', ')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--border-color)', margin: '14px 0 8px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          <span>TOTAL:</span>
                          <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Actualizar Estado (POS Táctil)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px' }}>
                        {[
                          { value: 'pendiente', label: '🕒 Pendiente', colorClass: 'warning' },
                          { value: 'en cocina', label: '🍳 Cocina', colorClass: 'primary' },
                          { value: 'en camino', label: '🛵 Camino', colorClass: 'info' },
                          { value: 'entregado', label: '✅ Entregado', colorClass: 'success' },
                          { value: 'cancelado', label: '❌ Cancelar', colorClass: 'danger' }
                        ].map((btn) => {
                          const isActive = order.status === btn.value;
                          return (
                            <button
                              key={btn.value}
                              type="button"
                              onClick={() => handleStatusChange(order, btn.value)}
                              className={`pos-tactile-btn ${isActive ? btn.colorClass : ''}`}
                              style={{
                                flexGrow: 1,
                                fontSize: '0.9rem',
                                padding: '8px'
                              }}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Bottom Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', marginTop: '4px' }}>
                      {order.status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order)}
                          className="pos-tactile-btn success"
                          style={{
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            flexGrow: 1,
                            fontWeight: '700'
                          }}
                        >
                          🟢 Tomar Pedido / Aceptar
                        </button>
                      )}
                      
                      {(order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi') && order.status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, 'en cocina')}
                          className="pos-tactile-btn success"
                          style={{
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            flexGrow: 1,
                            fontWeight: '700'
                          }}
                        >
                          ✓ Validar Transferencia
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => sendStatusWhatsApp(order)}
                        className="pos-tactile-btn"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          borderColor: '#25d366',
                          color: '#25d366'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.12 .946 11.5 .946c-5.423 0-9.842 4.37-9.846 9.8.001 1.93.523 3.8 1.511 5.4l-.993 3.625 3.73-.977zm11.536-6.52c-.27-.135-1.595-.788-1.842-.877-.248-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.586.067-1.18-.592-1.96-1.01-2.735-2.338-.204-.352.204-.326.583-1.085.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.005-.22-.529-.462-.458-.63-.466-.153-.008-.329-.01-.505-.01-.176 0-.463.067-.704.326-.241.26-.92.9-.92 2.196 0 1.297.945 2.546 1.077 2.726.133.18 1.861 2.842 4.508 3.982.63.272 1.12.434 1.503.555.632.201 1.21.172 1.665.105.508-.075 1.595-.653 1.82-.1282.225-.63.225-1.17.157-1.26-.068-.09-.248-.135-.518-.27z" />
                        </svg>
                        WhatsApp
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => printComanda(order)}
                        className="pos-tactile-btn primary"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          flexGrow: 1
                        }}
                      >
                        🖨️ Imprimir Comanda
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="btn-delete-action"
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: '1px solid rgba(255,0,0,0.15)',
                          backgroundColor: 'transparent',
                          width: '36px',
                          height: '36px'
                        }}
                        title="Eliminar de la lista"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="orders-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {/* Search Box */}
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label className="form-label" style={{ fontWeight: '600', margin: 0 }}>Buscar Pedidos Históricos</label>
              <input
                type="text"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="form-control"
                placeholder="🔍 Escribe el nombre del cliente, ID del pedido o platos..."
                style={{ fontSize: '1.05rem', height: '48px', width: '100%' }}
              />
            </div>

            {historyOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {orderSearchTerm ? 'No se encontraron pedidos que coincidan con la búsqueda.' : 'No hay pedidos en el historial (entregados o cancelados) todavía.'}
              </div>
            ) : (
              historyOrders.map((order) => {
                const dateObj = new Date(order.createdAt);
                const timeString = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString('es-CO');
                const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';

                return (
                  <div 
                    key={order.id} 
                    className="order-card animate-slide-up"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      boxShadow: 'var(--shadow-sm)',
                      opacity: 0.9
                    }}
                  >
                    {/* Top Row: Order ID, Time and Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                          Pedido #{orderNum}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                          {dateString} • {timeString}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.85rem',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            backgroundColor: order.status === 'cancelado' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(37, 211, 102, 0.15)',
                            color: order.status === 'cancelado' ? '#ff453a' : '#25d366',
                            border: '1px solid currentColor'
                          }}
                        >
                          {order.status === 'entregado' && '✅ Entregado'}
                          {order.status === 'cancelado' && '❌ Cancelado'}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Content Section: Domicilio & Productos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Left: Shipping details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Datos de Entrega</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0, fontSize: '1.05rem' }}>👤 <b>{order.clientName}</b></p>
                          <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            📞 <a href={`tel:${order.clientPhone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>{order.clientPhone}</a>
                          </p>
                          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>📍 {order.clientAddress}</p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                            Pago: 
                            <span 
                              style={{ 
                                marginLeft: '6px', 
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: order.paymentMethod === 'mixto'
                                  ? 'rgba(52, 152, 219, 0.15)'
                                  : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                    ? 'rgba(37,211,102,0.1)'
                                    : 'rgba(222,142,0,0.1)',
                                color: order.paymentMethod === 'mixto'
                                  ? '#3498db'
                                  : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                    ? '#25d366'
                                    : 'var(--accent-gold)'
                              }}
                            >
                              {order.paymentMethod === 'mixto'
                                ? '🔄 Pago Mixto'
                                : (order.paymentMethod === 'transfiya' || order.paymentMethod === 'nequi')
                                  ? '💳 Transferencia'
                                  : '💵 Contra Entrega'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Order list */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Detalles del Pedido</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name} <b style={{ color: 'var(--accent-gold)' }}>x{item.quantity}</b></span>
                                <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                              {item.sauces && item.sauces.length > 0 && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '12px' }}>
                                  Salsas: {item.sauces.join(', ')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--border-color)', margin: '14px 0 8px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          <span>TOTAL:</span>
                          <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Actualizar Estado (POS Táctil)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px' }}>
                        {[
                          { value: 'pendiente', label: '🕒 Pendiente', colorClass: 'warning' },
                          { value: 'en cocina', label: '🍳 Cocina', colorClass: 'primary' },
                          { value: 'en camino', label: '🛵 Camino', colorClass: 'info' },
                          { value: 'entregado', label: '✅ Entregado', colorClass: 'success' },
                          { value: 'cancelado', label: '❌ Cancelar', colorClass: 'danger' }
                        ].map((btn) => {
                          const isActive = order.status === btn.value;
                          return (
                            <button
                              key={btn.value}
                              type="button"
                              onClick={() => handleStatusChange(order, btn.value)}
                              className={`pos-tactile-btn ${isActive ? btn.colorClass : ''}`}
                              style={{
                                flexGrow: 1,
                                fontSize: '0.9rem',
                                padding: '8px'
                              }}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Bottom Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => sendStatusWhatsApp(order)}
                        className="pos-tactile-btn"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          borderColor: '#25d366',
                          color: '#25d366'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.12 .946 11.5 .946c-5.423 0-9.842 4.37-9.846 9.8.001 1.93.523 3.8 1.511 5.4l-.993 3.625 3.73-.977zm11.536-6.52c-.27-.135-1.595-.788-1.842-.877-.248-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.586.067-1.18-.592-1.96-1.01-2.735-2.338-.204-.352.204-.326.583-1.085.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.005-.22-.529-.462-.458-.63-.466-.153-.008-.329-.01-.505-.01-.176 0-.463.067-.704.326-.241.26-.92.9-.92 2.196 0 1.297.945 2.546 1.077 2.726.133.18 1.861 2.842 4.508 3.982.63.272 1.12.434 1.503.555.632.201 1.21.172 1.665.105.508-.075 1.595-.653 1.82-.1282.225-.63.225-1.17.157-1.26-.068-.09-.248-.135-.518-.27z" />
                        </svg>
                        WhatsApp
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => printComanda(order)}
                        className="pos-tactile-btn primary"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          flexGrow: 1
                        }}
                      >
                        🖨️ Imprimir Comanda
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="btn-delete-action"
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: '1px solid rgba(255,0,0,0.15)',
                          backgroundColor: 'transparent',
                          width: '36px',
                          height: '36px'
                        }}
                        title="Eliminar del historial"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          /* Products Table */
          <div className="admin-table-container animate-fade-in">
            {menuItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay productos registrados en el menú. Utilice el botón "Agregar Producto" para comenzar.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Imagen</th>
                    <th>Plato</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Insignia</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.image} alt={item.name} className="table-img" />
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '4px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge-category">{getCategoryLabel(item.category)}</span>
                      </td>
                      <td>
                        <span className="table-price">{formatPrice(item.price)}</span>
                      </td>
                      <td>
                        {item.badge ? (
                          <span className="menu-badge" style={{ position: 'static', display: 'inline-block' }}>
                            {item.badge}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Ninguna</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="btn-edit-action"
                            title="Editar producto"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.id, item.name)}
                            className="btn-delete-action"
                            title="Eliminar producto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'seguridad' && (
          <div className="order-card animate-fade-in" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} className="text-gold" style={{ flexShrink: 0 }} /> Parámetros de Acceso y Seguridad
            </h3>

            <form onSubmit={handleSecurityFormSubmit}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Credenciales de Acceso</h4>
              <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Contraseña de Administrador</label>
                  <input
                    type="text"
                    value={securityForm.password}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-control"
                    placeholder="Contraseña"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Ruta de Enlace Seguro (Hash)</label>
                  <input
                    type="text"
                    value={securityForm.secureHash}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, secureHash: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))}
                    className="form-control"
                    placeholder="ej: admin_chocquin_9924"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Solo letras, números, guiones y guiones bajos.</small>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Configuración de Recuperación de PIN por Correo</h4>
              <div className="admin-form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>Correo Electrónico de Recuperación</label>
                  <input
                    type="email"
                    value={securityForm.adminEmail}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="form-control"
                    placeholder="ej: admin@correo.com"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Donde llegará el PIN de 6 dígitos en caso de olvido.</small>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>EmailJS Service ID</label>
                  <input
                    type="text"
                    value={securityForm.emailjsServiceId}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, emailjsServiceId: e.target.value }))}
                    className="form-control"
                    placeholder="ej: service_xxxxxxx"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                  />
                </div>
              </div>

              <div className="admin-form-grid" style={{ marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>EmailJS Template ID</label>
                  <input
                    type="text"
                    value={securityForm.emailjsTemplateId}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, emailjsTemplateId: e.target.value }))}
                    className="form-control"
                    placeholder="ej: template_xxxxxxx"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600' }}>EmailJS Public Key</label>
                  <input
                    type="text"
                    value={securityForm.emailjsPublicKey}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, emailjsPublicKey: e.target.value }))}
                    className="form-control"
                    placeholder="ej: xxxxxxx-xxxxxxxx"
                    style={{ fontSize: '1.05rem', height: '48px' }}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Notificaciones de Nuevos Pedidos (Caja Registradora / POS)</h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <button
                  type="button"
                  onClick={() => setSecurityForm(prev => ({ ...prev, audioNotifications: !prev.audioNotifications }))}
                  className={`pos-tactile-btn ${securityForm.audioNotifications ? 'success' : ''}`}
                  style={{ flex: 1, minWidth: '220px', textTransform: 'none' }}
                >
                  {securityForm.audioNotifications ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  <span>{securityForm.audioNotifications ? '🔊 Timbre de Alerta Activado' : '🔇 Timbre de Alerta Desactivado'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSecurityForm(prev => ({ ...prev, voiceNotifications: !prev.voiceNotifications }))}
                  className={`pos-tactile-btn ${securityForm.voiceNotifications ? 'success' : ''}`}
                  style={{ flex: 1, minWidth: '220px', textTransform: 'none' }}
                >
                  {securityForm.voiceNotifications ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  <span>{securityForm.voiceNotifications ? '🗣️ Anuncio de Voz Activado' : '🔇 Anuncio de Voz Desactivado'}</span>
                </button>
              </div>

              {/* Secure Link Info Box & Copier */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Enlace de Acceso Administrador (Guardar como Marcador)</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  Este es el enlace secreto para ingresar a este panel. Compártelo con cuidado. Cualquier otro enlace (como #admin) no permitirá el acceso.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  marginBottom: '15px'
                }}>
                  <span style={{ whiteSpace: 'nowrap', userSelect: 'all' }}>{accessUrl}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`pos-tactile-btn ${copied ? 'success' : ''}`}
                  style={{ textTransform: 'none' }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? '¡Copiado con éxito!' : 'Copiar Enlace Secreto'}
                </button>
              </div>

              <button
                type="submit"
                className="pos-tactile-btn primary"
                style={{
                  width: '100%',
                  height: '54px',
                  fontSize: '1.05rem',
                  textTransform: 'none'
                }}
              >
                <Save size={18} /> Guardar Configuración de Seguridad
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal Popup */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '580px' }}>
            <button onClick={() => setIsFormOpen(false)} className="modal-close-btn" aria-label="Cerrar">
              <X size={20} />
            </button>
            
            <h3 className="modal-title">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
            <p className="modal-subtitle">
              Complete los campos para registrar el producto en el catálogo.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">Nombre del Plato</label>
                <input
                  type="text"
                  id="prod-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej: Raviolis de Salmón"
                  required
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Precio (COP)</label>
                  <input
                    type="number"
                    id="prod-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: 45000"
                    required
                  />
                  {errors.price && <p className="form-error">{errors.price}</p>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Categoría (POS Táctil)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px' }}>
                  {[
                    { value: 'hamburguesas', label: '🍔 Hamburguesas' },
                    { value: 'perros', label: '🌭 Perros' },
                    { value: 'salchipapas', label: '🍟 Salchipapas' },
                    { value: 'bebidas', label: '🥤 Bebidas' },
                    { value: 'especiales', label: '⭐ Combos' }
                  ].map((cat) => {
                    const isSel = formData.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`pos-tactile-btn ${isSel ? 'primary' : ''}`}
                        style={{
                          fontSize: '0.9rem',
                          padding: '10px'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-badge">Insignia (Opcional)</label>
                  <input
                    type="text"
                    id="prod-badge"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: Especial, Vegano, Nuevo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Foto del Alimento</label>
                  <div className="file-upload-wrapper">
                    <label className={`file-upload-label ${formData.image ? 'has-file' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon" style={{ opacity: 0.8 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {formData.image ? '✓ Foto cargada (Haz clic para cambiar)' : 'Seleccionar o arrastrar foto de la PC'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-upload-input"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {isUploading && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subiendo foto...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.1s ease' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {formData.image && (
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <span className="form-label">Vista Previa de la Foto</span>
                  <img 
                    src={formData.image} 
                    alt="Vista previa del plato" 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="prod-ingredients">Ingredientes (Separados por coma)</label>
                <input
                  type="text"
                  id="prod-ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej: Carne de res, Queso mozzarella, Tocineta"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-description">Descripción del Plato</label>
                <textarea
                  id="prod-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Describa los ingredientes y la preparación del plato..."
                  required
                ></textarea>
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '12px' }}
                disabled={isUploading}
              >
                <Save size={18} style={{ marginRight: '6px' }} /> {isUploading ? 'Subiendo Imagen...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
