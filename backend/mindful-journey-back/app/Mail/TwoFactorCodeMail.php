<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $code, public string $appName = 'Mindful Journey') {}

    public function build()
    {
        return $this->subject($this->appName.' - Votre code de connexion')
            ->view('emails.twofactor')
            ->with([
                'code' => $this->code,
                'appName' => $this->appName,
                'minutes' => 10,
            ]);
    }
}
