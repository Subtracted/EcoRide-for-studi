import { sendEmail, sendCancellationEmail, sendValidationEmail } from '../emailService';
import { Resend } from 'resend';

// Mock de Resend
jest.mock('resend');

describe('Email Service', () => {
    let mockSend;

    beforeEach(() => {
        // Réinitialiser les mocks avant chaque test
        mockSend = jest.fn().mockResolvedValue({ 
            data: { id: 'test-id' }, 
            error: null 
        });
        Resend.mockImplementation(() => ({
            emails: { send: mockSend }
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait envoyer un email de validation avec le bon format', async () => {
        const trajet = {
            depart: 'Paris',
            arrivee: 'Lyon',
            date_depart: new Date('2024-03-20T10:00:00'),
            conducteur: 'John Doe'
        };

        await sendValidationEmail('test@example.com', trajet);

        // Vérifier que l'email a été envoyé avec les bons paramètres
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
            from: 'EcoRide <notification@ecoride.fr>',
            to: 'test@example.com',
            subject: 'Validation de votre trajet',
            html: expect.stringContaining('Paris') // Vérifie que le contenu inclut la ville de départ
        }));
    });

    it('devrait gérer les erreurs d\'envoi d\'email', async () => {
        // Simuler une erreur
        mockSend.mockRejectedValue(new Error('Erreur d\'envoi'));

        const trajet = {
            depart: 'Paris',
            arrivee: 'Lyon',
            date_depart: new Date()
        };

        await expect(
            sendCancellationEmail('test@example.com', trajet)
        ).rejects.toThrow('Erreur d\'envoi');
    });

    it('devrait inclure toutes les informations requises dans l\'email d\'annulation', async () => {
        const trajet = {
            depart: 'Paris',
            arrivee: 'Lyon',
            date_depart: new Date('2024-03-20T10:00:00'),
            prix: 15
        };

        await sendCancellationEmail('test@example.com', trajet);

        const emailContent = mockSend.mock.calls[0][0].html;
        
        // Vérifier que l'email contient toutes les informations importantes
        expect(emailContent).toContain('Paris');
        expect(emailContent).toContain('Lyon');
        expect(emailContent).toContain('2024');
        expect(emailContent).toContain('Trajet Annulé');
    });
}); 