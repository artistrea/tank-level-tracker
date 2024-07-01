from flask import Flask, g
from .models import init_db
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['TRAP_HTTP_EXCEPTIONS']=True
    app.config['DATABASE'] = 'tanks.db'
    
    with app.app_context():
        init_db()

    from .controllers import bp as main_bp
    app.register_blueprint(main_bp)

    @app.teardown_appcontext
    def close_db(error):
        if 'db' in g:
            g.pop('db').close()
    
    return app