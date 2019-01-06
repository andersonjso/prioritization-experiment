package br.pucrio.inf.les.opus;

import org.jooby.Jooby;

/**
 * @author jooby generator
 */
public class App extends Jooby {

  {
    assets("/", "index.html");
    assets("/code", "codesnippets.html");

    assets("/bower_components/**");
    assets("/js/**");
    assets("/css/**");
    assets("/html/**");
    assets("/resources/**");
    assets("/data/**");
  }

  public static void main(final String[] args) {
    run(App::new, args);
  }

}
